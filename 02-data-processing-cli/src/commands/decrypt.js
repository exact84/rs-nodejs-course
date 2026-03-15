import { parseOptions } from "../utils/parse-options.js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";

export async function decrypt(state, ...args) {
  const options = parseOptions(args);
  const { input, output, password } = options;

  if (!input || !output || !password) {
    throw new Error("Missing required options");
  }

  const inputResolved = path.resolve(state.currentDir, input);
  const outputResolved = path.resolve(state.currentDir, output);

  const readStream = fs.createReadStream(inputResolved);
  const writeStream = fs.createWriteStream(outputResolved);

  let header = Buffer.alloc(0);
  let tailBuffer = Buffer.alloc(0);
  let decipher;

  const decryptTransform = new Transform({
    transform(chunk, _, callback) {
      if (header.length < 28) {
        const needed = 28 - header.length;
        header = Buffer.concat([header, chunk.slice(0, needed)]);
        chunk = chunk.slice(needed);

        if (header.length === 28) {
          const salt = header.subarray(0, 16);
          const iv = header.subarray(16, 28);
          const key = crypto.scryptSync(password, salt, 32);
          decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        }
      }

      if (!decipher) return callback();

      const combined = Buffer.concat([tailBuffer, chunk]);
      if (combined.length <= 16) {
        tailBuffer = combined;
        return callback();
      }

      tailBuffer = combined.subarray(combined.length - 16);
      const toProcess = combined.subarray(0, combined.length - 16);
      const out = decipher.update(toProcess);
      callback(null, out);
    },
    flush(callback) {
      if (!decipher || tailBuffer.length !== 16) {
        return callback(new Error("Operation failed"));
      }
      decipher.setAuthTag(tailBuffer);
      const final = decipher.final();
      callback(null, final);
    },
  });

  await pipeline(readStream, decryptTransform, writeStream);
}
