// hash-compare — Compare file hash with expected hash
// Calculate file hash and compare it with a value stored in a hash file.

// hash-compare --input file.txt --hash file.txt.sha256
// hash-compare --input file.txt --hash file.txt.md5 --algorithm md5
// --input — path to the input file (required)
// --hash — path to file with expected hash (required)
// --algorithm — hash algorithm to use (optional, default: sha256). Supported values: sha256, md5, sha512

// Output format:

// OK
// or
// MISMATCH

// Behavior:
// Must calculate hash of --input using Streams API
// Must read expected hash value from --hash file
// Comparison should be case-insensitive and ignore trailing newline in hash file
// Paths are relative to the current working directory or can be absolute
// If input or hash file doesn't exist, print Operation failed
// If algorithm is not supported, print Operation failed

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
