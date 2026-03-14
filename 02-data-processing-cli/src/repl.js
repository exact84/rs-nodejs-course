import * as nav from "./navigation.js";
import { parseArgs } from "./utils/parse-args.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { count } from "./commands/count.js";
import { hash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { encrypt } from "./commands/encrypt.js";
import { decrypt } from "./commands/decrypt.js";
import { logStats } from "./commands/logStats.js";

const GOODBYE_MESSAGE = "Thank you for using Data Processing CLI!";
const INVALID_INPUT_MESSAGE = "Invalid input";
export const FAILURE_MESSAGE = "Operation failed";

export function repl(rl, state) {
  const commands = {
    ".exit": () => {
      console.log(GOODBYE_MESSAGE);
      process.exit();
    },
    ls: nav.ls,
    cd: nav.cd,
    up: nav.up,
    "csv-to-json": csvToJson,
    "json-to-csv": jsonToCsv,
    count: count,
    hash: hash,
    "hash-compare": hashCompare,
    encrypt: encrypt,
    decrypt: decrypt,
    "log-stats": logStats,
  };

  process.on("SIGINT", () => {
    console.log(GOODBYE_MESSAGE);
    process.exit();
  });

  rl.on("close", () => {
    console.log(GOODBYE_MESSAGE);
    process.exit();
  });

  rl.prompt();

  rl.on("line", async (input) => {
    const [cmd, ...args] = parseArgs(input);
    try {
      const handler = commands[cmd];

      if (!handler) {
        console.log(INVALID_INPUT_MESSAGE);
      } else {
        await handler(state, ...args);
      }
    } catch (err) {
      console.log(FAILURE_MESSAGE);
    } finally {
      rl.setPrompt(`${state.currentDir}> `);
      rl.prompt();
    }
  });
}
