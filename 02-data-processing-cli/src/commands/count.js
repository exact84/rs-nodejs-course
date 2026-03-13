// count — Count lines, words, and characters in txt file
// Count lines, words, and characters in a file (similar to the wc command).

// count --input file.txt
// --input — path to the input file (required)
// Output format:

// Lines: 42
// Words: 350
// Characters: 2048
// Behavior:

// Must use Streams API to process the file (do not load the entire file into memory)
// A word is any sequence of non-whitespace characters
// Paths are relative to the current working directory or can be absolute
// If the input file doesn't exist, print Operation failed

import { createReadStream } from "node:fs";
import { parseOptions } from "../utils/parse-options.js";
import path from "node:path";
import { finished } from "node:stream/promises";

export async function count(state, ...args) {
  const options = parseOptions(args);
  let { input } = options;
  if (!input) {
    throw new Error("Missing input file");
  }

  const stream = createReadStream(path.resolve(state.currentDir, input));

  let leftover = "";
  let totalLines = 0;
  let words = 0;
  let chars = 0;

  stream.on("data", (chunk) => {
    const buffer = chunk.toString();
    leftover = leftover + buffer;
    chars += buffer.length;
    const lines = leftover.split(/\r?\n/);
    leftover = lines.pop();

    totalLines += lines.length;

    for (const line of lines) {
      words += line.split(/\s+/).filter(Boolean).length;
    }
  });

  try {
    await finished(stream);
  } catch (err) {
    throw new Error("Operation failed");
  }

  if (leftover) {
    totalLines += 1;
    words += leftover.split(/\s+/).filter(Boolean).length;
  }

  console.log(`Lines: ${totalLines}`);
  console.log(`Words: ${words}`);
  console.log(`Characters: ${chars}`);
}
