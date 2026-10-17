import os from "node:os";

export function machineInfo() {
  return {
    measuredAt: new Date().toISOString(),
    node: process.version,
    platform: `${os.platform()} ${os.release()} ${os.arch()}`,
    cpu: os.cpus()[0]?.model ?? "unknown",
    cpuCount: os.cpus().length,
    totalMemBytes: os.totalmem(),
  };
}
