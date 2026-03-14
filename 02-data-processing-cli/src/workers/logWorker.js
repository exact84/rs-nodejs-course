import { parentPort, workerData } from "worker_threads";
import fs from "fs";

const { filePath, start, end } = workerData;

function processLine(line, resultData) {
  if (!line) return;
  const [, level, , status, responseTimeMs, , path] = line.split(" ", 7);
  const rt = Number(responseTimeMs);
  if (!level || !status || !path || !Number.isFinite(rt)) return;
  resultData.total += 1;
  resultData.levels[level] = (resultData.levels[level] ?? 0) + 1;
  const statusClass = status[0] + "xx";
  resultData.status[statusClass] = (resultData.status[statusClass] ?? 0) + 1;
  resultData.responseTimeSum += rt;
  resultData.pathsMap[path] = (resultData.pathsMap[path] ?? 0) + 1;
}

async function run() {
  const stream = fs.createReadStream(filePath, {
    start,
    end,
    encoding: "utf8",
  });
  let leftover = "";
  const resultData = {
    total: 0,
    levels: {},
    status: {},
    pathsMap: {},
    responseTimeSum: 0,
  };

  for await (const chunk of stream) {
    leftover += chunk;
    const lines = leftover.split(/\r?\n/);
    leftover = lines.pop();

    for (const line of lines) {
      processLine(line, resultData);
    }
  }
  processLine(leftover, resultData);

  parentPort.postMessage(resultData);
}

run();
