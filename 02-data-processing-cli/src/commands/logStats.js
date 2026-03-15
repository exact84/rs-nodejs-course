import os from "os";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { parseOptions } from "../utils/parse-options.js";
import { formatStats } from "../utils/format-stats.js";

export async function logStats(state, ...args) {
  const options = parseOptions(args);
  const { input, output } = options;

  if (!input || !output) {
    throw new Error("Missing required options");
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  let chunks = [];

  const inputResolved = path.resolve(state.currentDir, input);
  const outputResolved = path.resolve(state.currentDir, output);
  const workerPath = path.join(__dirname, "../workers/logWorker.js");

  const stat = await fs.stat(inputResolved);
  if (!stat.isFile()) {
    throw new Error("Input file does not exist");
  }
  if (stat.size === 0) {
    const emptyResult = {
      total: 0,
      levels: {},
      status: {},
      topPaths: [],
      avgResponseTimeMs: 0,
    };
    await fs.writeFile(outputResolved, JSON.stringify(emptyResult, null, 2));
    return;
  }

  const N = Math.min(os.cpus().length, stat.size);

  const chunkSize = Math.ceil(stat.size / N);
  const bufferSize = 64 * 1024;
  const buffer = Buffer.alloc(bufferSize);

  async function findNextNewline(fd, position, fileSize) {
    if (position >= fileSize) return fileSize - 1;
    let offset = position;
    while (offset < fileSize) {
      const toRead = Math.min(bufferSize, fileSize - offset);
      const { bytesRead } = await fd.read(buffer, 0, toRead, offset);
      if (bytesRead === 0) break;
      const idx = buffer.indexOf(10, 0);
      if (idx !== -1 && idx < bytesRead) {
        return offset + idx;
      }
      offset += bytesRead;
    }
    return fileSize - 1;
  }

  const fd = await fs.open(inputResolved, "r");
  try {
    let start = 0;
    for (let i = 0; i < N; i += 1) {
      if (start >= stat.size) break;
      let end = Math.min(start + chunkSize - 1, stat.size - 1);
      if (i < N - 1) {
        end = await findNextNewline(fd, end, stat.size);
      }
      if (start <= end) {
        chunks.push({ start, end });
      }
      start = end + 1;
    }
  } finally {
    await fd.close();
  }

  const promises = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, {
        workerData: {
          filePath: inputResolved,
          start: chunk.start,
          end: chunk.end,
        },
      });

      worker.once("message", resolve);
      worker.once("error", reject);
      worker.once("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  });

  const results = await Promise.all(promises);

  function mergeMap(target, source) {
    for (const [key, value] of Object.entries(source)) {
      target[key] = (target[key] ?? 0) + value;
    }
  }

  const final = {
    total: 0,
    responseTimeSum: 0,
    levels: {},
    status: {},
    pathsMap: {},
    avgResponseTimeMs: 0,
  };

  for (const worker of results) {
    final.total += worker.total;
    final.responseTimeSum += worker.responseTimeSum;

    mergeMap(final.levels, worker.levels);
    mergeMap(final.status, worker.status);
    mergeMap(final.pathsMap, worker.pathsMap);
  }

  final.avgResponseTimeMs =
    final.total === 0
      ? 0
      : Number((final.responseTimeSum / final.total).toFixed(2));

  final.topPaths = Object.entries(final.pathsMap)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count);

  delete final.pathsMap;
  delete final.responseTimeSum;

  await fs.writeFile(outputResolved, formatStats(final));
}
