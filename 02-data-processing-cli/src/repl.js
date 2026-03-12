import * as nav from "./navigation.js";

const GOODBYE_MESSAGE = "Thank you for using Data Processing CLI!";
const INVALID_INPUT_MESSAGE = "Invalid input";
const FAILURE_MESSAGE = "Operation failed";

export function repl(rl, state) {
  const commands = {
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

  rl.on("line", (input) => {
    const [cmd, ...args] = input.trim().split(" ");
    try {
      const handler = commands[cmd];

      if (!handler) {
        console.log(INVALID_INPUT_MESSAGE);
      } else {
        handler(state, ...args);
      }
    } catch (err) {
      console.log(`${FAILURE_MESSAGE}: ${err.message}`);
    }
    rl.setPrompt(`${state.currentDir}> `);
    rl.prompt();
  });
}
