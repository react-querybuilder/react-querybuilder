/**
 * Type-only assertions pinning the **variance** of {@link Schema} and
 * {@link @react-querybuilder/core!QueryManager}. No runtime code; this file exists to be
 * typechecked (`bun typecheck:rqb`).
 *
 * Both are **invariant** in their field type parameter, so a `Schema<MyField, 'eq'>` cannot be
 * passed where a `Schema<FullField, string>` is expected without a cast. That is not an
 * oversight, and it is not fixable with TypeScript variance annotations: `in out` *asserts*
 * invariance, it never widens assignability. See the doc comment on `Schema` in `./props`.
 *
 * The `@ts-expect-error` assertions below are the load-bearing ones — each goes red if the
 * assignment ever starts succeeding, which is the signal that someone changed the shape of
 * `Schema` or `QueryManager` (deliberately or not) and that the casts justified by this file can
 * be removed.
 */

import type { FullField, QueryManager, RuleGroupTypeAny } from '@react-querybuilder/core';
import type { Schema } from './props';

interface MyField extends FullField<'a' | 'b'> {}

type NarrowSchema = Schema<MyField, 'eq'>;
type WideSchema = Schema<FullField, string>;

type NarrowManager = QueryManager<RuleGroupTypeAny, MyField>;
// `FullField` is the default here, but spelling it out is the entire point of the comparison.
// oxlint-disable-next-line typescript/no-unnecessary-type-arguments
type WideManager = QueryManager<RuleGroupTypeAny, FullField>;

declare const narrowSchema: NarrowSchema;
declare const narrowManager: NarrowManager;

// #region Schema

/**
 * `Schema` is invariant in `F`. This is why `ValueEditor` casts `schema` when handing it to a
 * `valueSelector`, whose props are declared with the default (widest) type arguments.
 */
// @ts-expect-error Schema is invariant in F
export const _wideSchema: WideSchema = narrowSchema;

/**
 * `controls` is the *entire* reason. Every other member is either covariant in `F` (`fields`,
 * `fieldMap`) or declared with method shorthand (`getOperators`, `getValues`, …), and method
 * parameters are compared bivariantly even under `strictFunctionTypes`. `controls` holds
 * `ComponentType<…Props<F, O>>` values as *properties*, which are contravariant in `F`, and the
 * combination is what makes the whole interface invariant.
 *
 * If this line ever goes red, something else acquired a contravariant `F` position and the
 * explanation above is stale.
 */
export const _wideSchemaWithoutControls: Omit<WideSchema, 'controls'> = narrowSchema;

// #endregion

// #region QueryManager

/** `QueryManager` is likewise invariant in `F`. */
// @ts-expect-error QueryManager is invariant in F
export const _wideManager: WideManager = narrowManager;

/**
 * And intrinsically so, rather than as an artifact of its private `state` accessor: `getOptions`
 * alone is enough, since `QueryManagerOptions<F, …>` holds function-typed *properties*
 * (`getDefaultField`, `getDefaultValue`, …) that are contravariant in `F`.
 */
// @ts-expect-error getOptions alone makes QueryManager invariant in F
export const _wideManagerOptions: Pick<WideManager, 'getOptions'> = narrowManager;

/** The covariant half, for contrast: reading fields back out widens fine. */
export const _wideManagerFields: Pick<WideManager, 'getFields'> = narrowManager;

// #endregion
