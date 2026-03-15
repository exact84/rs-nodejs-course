import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { FAILURE_MESSAGE } from "../repl.js";
import { parseOptions } from "../utils/parse-options.js";

export async function jsonToCsv(state, ...args) {
  const options = parseOptions(args);
  const { input = "data.json", output = "data.csv" } = options;

  let leftover = "";
  let headers = [];
  let headersRecord = true;

  try {
    const readStream = createReadStream(path.resolve(state.currentDir, input), {
      encoding: "utf8",
    });

    const writeStream = createWriteStream(
      path.resolve(state.currentDir, output),
      {
        encoding: "utf8",
      },
    );

    const transformStream = new Transform({
      transform(chunk, _, callback) {
        leftover = leftover + chunk;
        leftover = leftover.replace(/^\s*\[?\s*,?/, "");

        const matches = leftover.match(/\{[^}]+\}/g);

        if (matches) {
          for (const objStr of matches) {
            const obj = JSON.parse(objStr);

            if (headersRecord) {
              headers = Object.keys(obj);
              this.push(headers.join(",") + "\n");
              headersRecord = false;
            }

            const row = headers.map((h) => obj[h] ?? "").join(",");
            this.push(row + "\n");
          }

          leftover = leftover.slice(leftover.lastIndexOf("}") + 1);
        }

        callback();
      },
      flush(callback) {
        leftover = leftover.trim().replace(/\]$/, "");
        if (leftover) {
          try {
            const obj = JSON.parse(leftover);
            if (headersRecord) {
              headers = Object.keys(obj);
              this.push(headers.join(",") + "\n");
              headersRecord = false;
            }
            const row = headers.map((header) => obj[header] ?? "").join(",");
            this.push(row + "\n");
          } catch (err) {
            return callback(err);
          }
        }
        callback();
      },
    });

    await pipeline(readStream, transformStream, writeStream);

    readStream.on("error", () => console.log(FAILURE_MESSAGE));
    transformStream.on("error", () => console.log(FAILURE_MESSAGE));
    writeStream.on("error", () => console.log(FAILURE_MESSAGE));
  } catch (err) {
    console.log(FAILURE_MESSAGE);
  }
}
