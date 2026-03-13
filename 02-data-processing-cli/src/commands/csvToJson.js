import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { FAILURE_MESSAGE } from "../repl.js";
import { parseOptions } from "../utils/parse-options.js";

export async function csvToJson(state, ...args) {
  const options = parseOptions(args);
  const { input = "data.csv", output = "data.json" } = options;

  let leftover = "";

  let headers = null;
  let firstRecord = true;

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
        const lines = leftover.split(/\r?\n/);
        leftover = lines.pop();

        for (const line of lines) {
          if (line.trim() !== "") {
            if (!headers) {
              headers = line.split(",");
              continue;
            }
            const fields = line.split(",");
            const jsonObj = headers.reduce((acc, key, i) => {
              acc[key] = fields[i] ?? null;
              return acc;
            }, {});
            const jsonStr =
              (firstRecord ? "" : ",\n") + JSON.stringify(jsonObj, null, 2);
            firstRecord = false;
            this.push(jsonStr);
          }
        }
        callback();
      },
      flush(callback) {
        leftover = leftover.trim();
        if (leftover) {
          const fields = leftover.split(",");
          const jsonObj = headers.reduce((acc, key, i) => {
            acc[key] = fields[i] ?? null;
            return acc;
          }, {});
          const jsonStr =
            (firstRecord ? "" : ",\n") + JSON.stringify(jsonObj, null, 2);
          this.push(jsonStr);
        }

        this.push("\n]\n");
        callback();
      },
    });

    writeStream.write("[\n");

    await pipeline(readStream, transformStream, writeStream);

    console.log("File written:", output);

    readStream.on("error", (err) => console.log(FAILURE_MESSAGE, err));
    transformStream.on("error", (err) => console.log(FAILURE_MESSAGE, err));
    writeStream.on("error", (err) => console.log(FAILURE_MESSAGE, err));
  } catch (err) {
    console.log(FAILURE_MESSAGE, err);
  }
}
