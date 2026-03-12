import fs from "node:fs";
import path from "node:path";

export function up(state) {
  const parentDir = path.dirname(state.currentDir);
  state.currentDir = parentDir;
}

export function ls(state) {
  const files = fs.readdirSync(state.currentDir);
  for (const file of files) {
    console.log(file);
  }
}

export function cd(state, dir) {
  const newDir = path.resolve(state.currentDir, dir);
  if (!fs.existsSync(newDir) || !fs.statSync(newDir).isDirectory()) {
    console.log("Directory does not exist");
    return;
  }
  state.currentDir = newDir;
}
