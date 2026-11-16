# @derpdaderp/chartkit

This package has moved to [@chartkitdev/react](https://www.npmjs.com/package/@chartkitdev/react) and [@chartkitdev/core](https://www.npmjs.com/package/@chartkitdev/core).

[chartkit.dev](https://chartkit.dev)

Upgrading: [chartkit.dev/docs/migrate](https://chartkit.dev/docs/migrate)

0.5.0 re-exports `@chartkitdev/react/legacy`, the frozen v0 components, hooks, themes and helpers, so existing imports keep working. `<Chart spec={...} />` is in `@chartkitdev/react`. It is last in the publish order. After that version is on npm, deprecate the older releases:

```bash
npm deprecate @derpdaderp/chartkit@"<0.5.0" "This package has moved to @chartkitdev/react and @chartkitdev/core. https://chartkit.dev/docs/migrate"
```

To deprecate the shim itself once nothing should install this name:

```bash
npm deprecate @derpdaderp/chartkit "This package has moved to @chartkitdev/react and @chartkitdev/core. https://chartkit.dev/docs/migrate"
```
