import { SpelExpressionEvaluator } from 'spel2js';

/**
 * Shared contract for a SpEL evaluator backend. Two implementations satisfy it: a `spel2js`-based,
 * in-process one ({@link spel2jsEvaluator}) and a real Spring/Java one (see `verifySpELEvaluator`).
 * `typemap` is unused by the JS backend (JS is dynamically typed) but retained for contract parity
 * with the Java backend.
 */
export type SpELEvaluator = (params: {
  data: unknown[];
  spel: string;
  typemap: Record<string, string>;
}) => Promise<unknown[]>;

/**
 * Evaluates a SpEL expression in-process via `spel2js`.
 *
 * `spel2js` resolves the bare field identifiers that `formatQuery('spel')` emits by default against
 * the record root, so no `#root['field']` rewrite is needed (matching the Java backend).
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
