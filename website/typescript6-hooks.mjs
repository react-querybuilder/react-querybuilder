// ESM resolve hook: redirect bare `typescript` imports to `@typescript/typescript6`
// (TS6 API). typedoc needs the TS6 compiler API; the repo otherwise runs on TS7.
// Scoped to the website build via NODE_OPTIONS in package.json scripts.

// TODO: remove this (and @typescript/typescript6 + the loader/NODE_OPTIONS wiring)
// once typedoc properly supports TS7. See https://github.com/TypeStrong/typedoc/issues/3098
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'typescript') return nextResolve('@typescript/typescript6', context);
  return nextResolve(specifier, context);
}
