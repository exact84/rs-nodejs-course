import fs from "node:fs/promises";
import path from "node:path";

export function up(state) {
  const parentDir = path.dirname(state.currentDir);
  state.currentDir = parentDir;
}

export async function ls(state) {
  const files = await fs.readdir(state.currentDir, { withFileTypes: true });

  files.sort((a, b) => {
    const typeDiff = Number(b.isDirectory()) - Number(a.isDirectory());
    if (typeDiff !== 0) return typeDiff;

    return a.name.localeCompare(b.name, "en", {
      sensitivity: "base",
      numeric: true,
    });
  });

  for (const file of files) {
    console.log(file.name);
  }
}

export async function cd(state, dir) {
  const stat = await fs.stat(path.resolve(state.currentDir, dir));
  if (!stat.isDirectory()) {
    throw new Error("");
  }
  state.currentDir = newDir;
}
