import { SpelExpressionEvaluator } from 'spel2js';

/**
 * Shared contract for a SpEL evaluator backend. Phase 1 provides a `spel2js`-based,
 * in-process implementation ({@link spel2jsEvaluator}); Phase 2 will add a real Spring/Java
 * backend behind this same signature. `typemap` is unused by the JS backend (JS is dynamically
 * typed) but retained for contract parity with the future Java backend, which needs it for value
 * coercion.
 */
export type SpELEvaluator = (params: {
  data: unknown[];
  spel: string;
  typemap: Record<string, string>;
}) => Promise<unknown[]>;

/**
 * Phase 1 backend: evaluates a SpEL expression in-process via `spel2js`.
 *
 * Field references must use `#root['field']` indexer syntax (see `dbquery.spel.test.ts` field
 * transforms). Bare `['field']` does not resolve against the root in `spel2js`; `#root['field']`
 * works in both `spel2js` and real Spring SpEL (Map root, no `MapAccessor` needed).
 *
 * Returns the subset of `data` for which the expression evaluates to `true`.
 */
export const spel2jsEvaluator: SpELEvaluator = async ({ data, spel }) =>
  data.filter(record => {
    try {
      return SpelExpressionEvaluator.eval(spel, record) === true;
    } catch {
      return false;
    }
  });
