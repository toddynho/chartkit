/** Replace on-demand chart imports with an empty module so an IIFE does not inline them. */
export const stubDynamicCharts = {
  name: "stub-dynamic-charts",
  setup(build) {
    build.onResolve({ filter: /^\.\/(load|extra-tip|mermaid-phase4|canvas\/hydrate|layout|charts\/[a-z0-9-]+)$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: args.path, namespace: "chartkit-stub" };
    });
    build.onResolve({ filter: /canvas\/hydrate$/ }, (args) => {
      if (args.kind !== "dynamic-import") return null;
      return { path: args.path, namespace: "chartkit-stub" };
    });
    build.onLoad({ filter: /.*/, namespace: "chartkit-stub" }, () => ({
      contents: "export function load(){return Promise.resolve(undefined)} export function attach(){return {destroy(){}}} export function hydrate(){} export function release(){} export function paintSpec(){return false} export function lastPaintProfile(){return null} export function mountLayout(){} export default {}",
      loader: "js",
    }));
  },
};
