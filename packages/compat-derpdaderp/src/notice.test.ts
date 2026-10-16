import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyOnce } from "./notice";

const KEY = "__chartkit_derpdaderp_notice__";

describe("compatibility notice", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as Record<string, unknown>)[KEY];
    vi.unstubAllEnvs();
  });

  it("logs once in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete (globalThis as Record<string, unknown>)[KEY];
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    notifyOnce();
    notifyOnce();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("@chartkitdev/react");
  });

  it("stays quiet in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete (globalThis as Record<string, unknown>)[KEY];
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    notifyOnce();
    expect(warn).not.toHaveBeenCalled();
  });
});
