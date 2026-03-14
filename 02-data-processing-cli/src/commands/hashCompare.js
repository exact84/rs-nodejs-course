import path from "node:path";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { parseOptions } from "../utils/parse-options.js";
import { hashAlgorithms } from "./hash.js";

export async function hashCompare(state, ...args) {
  const options = parseOptions(args);
  const { input, hash, algorithm = "sha256" } = options;

  if (!input) {
    throw new Error("Missing input file");
  }
  if (!hash) {
    throw new Error("Missing hash file");
  }
  if (!hashAlgorithms.has(algorithm)) {
    throw new Error("Unsupported algorithm");
  }

  const readStream = createReadStream(path.resolve(state.currentDir, input));
  const calcHash = createHash(algorithm);

  for await (const chunk of readStream) {
    calcHash.update(chunk);
  }
  const actualHash = calcHash.digest("hex").toLowerCase();

  const expectedHash = (
    await readFile(path.resolve(state.currentDir, hash), "utf8")
  )
    .trim()
    .toLowerCase();

  const result = actualHash === expectedHash ? "OK" : "MISMATCH";
  console.log(result);
}
