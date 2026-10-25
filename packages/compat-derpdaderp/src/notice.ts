const NOTICE_KEY = "__chartkit_derpdaderp_notice__";

/** One console warning per page load, and only when NODE_ENV is not production. */
export function notifyOnce(): void {
  const globalState = globalThis as typeof globalThis & { [NOTICE_KEY]?: boolean };
  if (globalState[NOTICE_KEY]) return;
  globalState[NOTICE_KEY] = true;
  const nodeEnv = typeof process !== "undefined" ? process.env?.NODE_ENV : undefined;
  if (nodeEnv === "production") return;
  console.warn(
    "[@derpdaderp/chartkit] This package has moved to @chartkitdev/react. " +
      "This compatibility shim re-exports that package and logs this notice once in development. " +
      "Install @chartkitdev/react (and @chartkitdev/core for the JSON spec). " +
      "See catalog/migrate.md for the rename and the npm deprecate command.",
  );
}
