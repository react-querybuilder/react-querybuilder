import { preferAnyProp, preferProp } from '@react-querybuilder/core';

/**
 * For given default, prop, and context values, return the first provided of prop,
 * context, and default, in that order.
 *
 * @group Hooks
 */
export const usePreferProp = (
  def: boolean,
  prop?: boolean,
  context?: boolean,
  doNotFinalize?: boolean
): boolean => preferProp(def, prop, context, doNotFinalize);

/**
 * For given default, prop, and context values, return the first provided of prop,
 * context, and default, in that order.
 *
 * @group Hooks
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const usePreferAnyProp = (def?: any, prop?: any, context?: any): any =>
  preferAnyProp(def, prop, context);
