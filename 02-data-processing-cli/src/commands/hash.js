// hash — Calculate file hash
// Calculate a cryptographic hash of a file.

// hash --input file.txt
// hash --input file.txt --algorithm md5
// hash --input file.txt --save
// --input — path to the input file (required)
// --algorithm — hash algorithm to use (optional, default: sha256). Supported values: sha256, md5, sha512
// --save — optional flag; if provided, save hash to a file next to the source file
// Output format:

// sha256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
// Behavior:

// Must use crypto.createHash with Streams API
// Paths are relative to the current working directory or can be absolute
// If the input file doesn't exist, print Operation failed
// If the algorithm is not supported, print Operation failed
// If --save is passed, write hash to <inputFilename>.<algorithm> (example: file.txt.sha256)
import path from "node:path";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { parseOptions } from "../utils/parse-options.js";

const hashAlgorithms = new Set(["sha256", "md5", "sha512"]);

export async function hash(state, ...args) {
  const options = parseOptions(args);
  const { input, algorithm = "sha256", save } = options;

  if (!input) {
    throw new Error("Missing input file");
  }
  if (!hashAlgorithms.has(algorithm)) {
    throw new Error("Unsupported algorithm");
  }

  const resolvedInput = path.resolve(state.currentDir, input);
  const readStream = createReadStream(resolvedInput);
  const hash = createHash(algorithm);

  for await (const chunk of readStream) {
    hash.update(chunk);
  }
  const actualHash = hash.digest("hex");

  console.log(`${algorithm}: ${actualHash}`);

  if (save) {
    const outputPath = path.join(
      path.dirname(resolvedInput),
      `${path.basename(resolvedInput)}.${algorithm}`,
    );
    await writeFile(outputPath, actualHash);
  }
}
