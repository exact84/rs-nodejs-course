import path from "node:path";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import { parseOptions } from "../utils/parse-options.js";

export const hashAlgorithms = new Set(["sha256", "md5", "sha512"]);

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
