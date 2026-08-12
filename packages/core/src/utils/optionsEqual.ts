import type { FullCombinator, FullField, FullOperator } from '../types';
// Type-only, so this does not create a cycle with `QueryManager.ts`, which imports `optionsEqual`.
import type { QueryManagerOptions } from './QueryManager';

const isPlainObject = (x: object): boolean => {
  const proto = Object.getPrototypeOf(x);
  return proto === null || proto === Object.prototype;
};

/**
 * Structural equality for {@link QueryManagerOptions} values. Arrays and plain objects are
 * compared by value; everything else — functions, class instances, `Map`s, `Date`s — by
 * identity.
 *
 * That split is what makes an options object rebuilt on every render compare equal as long as
 * its _data_ did not change, which is the entire point: a caller that passes object literals
 * (`fields={[...]}`, `translations={{...}}`) hands a fresh identity to every reconfigure, so an
 * identity-only comparison would report a change every time.
 *
 * Comparing functions by identity is deliberate rather than a limitation. Two functions cannot
 * be proven equivalent, so a caller that rebuilds `getDefaultValue` per render must either
 * memoize it or accept the reconfigure.
 */
export const valuesEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((v, i) => valuesEqual(v, b[i]))
    );
  }

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  // Different shapes are never equal, and non-plain objects (class instances, `Date`, `Map`,
  // …) are compared by identity only — their state is not exhausted by their own enumerable
  // keys, so a key-wise walk would report two distinct `Date`s as equal.
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b) || !isPlainObject(a)) return false;

  const aKeys = Object.keys(a);
  return (
    aKeys.length === Object.keys(b).length &&
    aKeys.every(k =>
      valuesEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    )
  );
};

/**
 * Whether two {@link QueryManagerOptions} objects describe the same configuration, per
 * {@link valuesEqual}: data by value, functions by identity.
 *
 * {@link QueryManager.reconfigure} uses this to gate itself, so most callers never need it
 * directly. It is exported for framework adapters that decide whether to _call_ `reconfigure`
 * at all — skipping the call avoids building the merged options object in the first place.
 *
 * Nested option objects (`history`, `translations`, …) are descended into rather than compared
 * by identity, so `{ history: { maxHistory: 10 } }` rebuilt per render compares equal.
 */
export const optionsEqual = <
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
>(
  a: Partial<QueryManagerOptions<F, O, C>> | undefined,
  b: Partial<QueryManagerOptions<F, O, C>> | undefined
): boolean => valuesEqual(a, b);
