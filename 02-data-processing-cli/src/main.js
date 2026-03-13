import readline from "node:readline";
import os from "node:os";
import { repl } from "./repl.js";

const homeDir = os.homedir();

function main() {
  // sets up REPL
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  // handles navigation state
  const state = {
    currentDir: homeDir,
  };

  console.log("Welcome to Data Processing CLI!");
  console.log("You are currently in", homeDir);

  repl(rl, state);
}

main();
