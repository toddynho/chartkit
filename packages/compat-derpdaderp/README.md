# @derpdaderp/chartkit

Compatibility shim for code that still imports `@derpdaderp/chartkit`.

It re-exports [`@chartkitdev/react`](https://www.npmjs.com/package/@chartkitdev/react) and, outside production, logs a one-time console notice. New code should depend on `@chartkitdev/react` and `@chartkitdev/core` directly.

This package is prepared for a later publish. It is not published by this repository's CI unless someone runs the manual publish workflow. See [catalog/migrate.md](../../catalog/migrate.md).
