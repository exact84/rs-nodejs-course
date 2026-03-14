import { parseOptions } from "../utils/parse-options.js";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";

export async function encrypt(state, ...args) {
  const options = parseOptions(args);
  const { input, output, password } = options;

  if (!input || !output || !password) {
    throw new Error("Missing required options");
  }

  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const appendAuthTag = new Transform({
    transform(chunk, _, callback) {
      callback(null, chunk);
    },
    flush(callback) {
      const authTag = cipher.getAuthTag();
      this.push(authTag);
      callback();
    },
  });

  const readStream = fs.createReadStream(path.resolve(state.currentDir, input));
  const writeStream = fs.createWriteStream(
    path.resolve(state.currentDir, output),
  );

  writeStream.write(Buffer.concat([salt, iv]));

  await pipeline(readStream, cipher, appendAuthTag, writeStream);
}
