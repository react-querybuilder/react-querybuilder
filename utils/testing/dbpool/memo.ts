// Shared primitives for the process-wide DB harnesses (`bun test` runs all files in one process
// w/ a shared module registry, so module-level memos = one client/pool per run).

// Memoize async init, but forget rejections so later callers retry instead of inheriting a
// stale failure (e.g. transient port error) for the rest of the run.
export const memo = <T>(init: () => Promise<T>) => {
  let p: Promise<T> | undefined;
  return {
    get: (): Promise<T> =>
      (p ??= init().catch(e => {
        p = undefined;
        throw e;
      })),
    // Settled value (if any) for teardown; clears cache. Never throws.
    take: async (): Promise<T | undefined> => {
      const cur = p;
      p = undefined;
      return cur?.catch(() => undefined);
    },
  };
};

const labelRE = /^[a-z0-9_]+$/;
let schemaCounter = 0;

// Reserve a globally-unique schema name (does not create it). Single counter shared by every DB
// harness. Module-scope calls guarantee uniqueness across files independent of execution order.
// Label restricted -> safe to quote (and valid as an Oracle user name).
export const reserveSchema = (label: string = 'ctx'): string => {
  if (!labelRE.test(label)) throw new Error(`Invalid schema label: ${label}`);
  return `rqb_${label}_${++schemaCounter}`;
};

// Run every teardown stage even if earlier ones fail; aggregate errors.
export const teardown = async (
  label: string,
  stages: (() => Promise<unknown>)[],
  extraErrors: () => unknown[] = () => []
): Promise<void> => {
  const errors: unknown[] = [];
  for (const stage of stages) {
    try {
      await stage();
    } catch (e) {
      errors.push(e);
    }
  }
  errors.push(...extraErrors());
  if (errors.length > 0) throw new AggregateError(errors, `${label} teardown failed`);
};
