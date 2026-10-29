# @derpdaderp/chartkit

Compatibility shim for code that still imports `@derpdaderp/chartkit`.

It re-exports [`@chartkitdev/react`](https://www.npmjs.com/package/@chartkitdev/react) and, outside production, logs a one-time console notice. New code should depend on `@chartkitdev/react` and `@chartkitdev/core` directly.

```bash
npm install @derpdaderp/chartkit
```

The manual publish workflow ships this package after `@chartkitdev/react`. It is not what a new app installs. See [catalog/migrate.md](../../catalog/migrate.md).
