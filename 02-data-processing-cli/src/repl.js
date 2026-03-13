import * as nav from "./navigation.js";
import { parseArgs } from "./utils/parse-args.js";

const GOODBYE_MESSAGE = "Thank you for using Data Processing CLI!";
const INVALID_INPUT_MESSAGE = "Invalid input";
const FAILURE_MESSAGE = "Operation failed";

export function repl(rl, state) {
  const commands = {
    ".exit": () => process.exit(),
    ls: nav.ls,
    cd: nav.cd,
    up: nav.up,

    // "csv-to-json": csvToJson,
    // "json-to-csv": jsonToCsv,
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
      console.log(`${FAILURE_MESSAGE}: ${err.message}`);
    } finally {
      rl.setPrompt(`${state.currentDir}> `);
      rl.prompt();
    }
  });
}
