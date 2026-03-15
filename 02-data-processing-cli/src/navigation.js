import fs from "node:fs/promises";
import path from "node:path";

export function up(state) {
  const parentDir = path.dirname(state.currentDir);
  state.currentDir = parentDir;
}

export async function ls(state) {
  const entries = await fs.readdir(state.currentDir, { withFileTypes: true });

  entries.sort((a, b) => {
    const typeDiff = Number(b.isDirectory()) - Number(a.isDirectory());
    if (typeDiff !== 0) return typeDiff;

    return a.name.localeCompare(b.name, "en", {
      sensitivity: "base",
      numeric: true,
    });
  });

  const maxLength = Math.max(...entries.map((e) => e.name.length));

  for (const entry of entries) {
    const typeLabel = entry.isDirectory() ? "[folder]" : "[file]";
    const padding = " ".repeat(maxLength - entry.name.length);
    console.log(`${entry.name}${padding}\t${typeLabel}`);
  }
}

export async function cd(state, dir) {
  if (!dir) {
    throw new Error("Missing directory argument");
  }

  const newDir = path.resolve(state.currentDir, dir);
  const stat = await fs.stat(newDir);

  if (!stat.isDirectory()) {
    throw new Error("");
  }

  state.currentDir = newDir;
}
