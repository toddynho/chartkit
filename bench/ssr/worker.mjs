import { parentPort, workerData } from "node:worker_threads";
import { summarize } from "../lib/time.mjs";
import { prepareRival } from "./rivals.mjs";

try {
  const run = await prepareRival(workerData);
  await run();
  parentPort.postMessage({ type: "progress" });
  const samples = [];
  for (let i = 0; i < workerData.samples; i++) {
    const start = performance.now();
    await run();
    samples.push(performance.now() - start);
    parentPort.postMessage({ type: "progress" });
  }
  const rounded = samples.map((value) => Math.round(value * 100) / 100);
  parentPort.postMessage({
    type: "done",
    timing: { ...summarize(rounded), samples: rounded },
  });
} catch (error) {
  parentPort.postMessage({
    type: "fail",
    error: error instanceof Error ? error.message : String(error),
  });
}
