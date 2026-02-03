import { queryBuilderFlagDefaults } from '../defaults';
import type { QueryBuilderFlags } from '../types';
import { objectEntries } from './objectUtils';

const preferPropDefaultTrue = (prop?: boolean, context?: boolean) =>
  prop === false ? false : prop ? true : !(context === false);

const preferPropDefaultFalse = (prop?: boolean, context?: boolean) =>
  prop ? true : prop === false ? false : !!context;

/**
 * For given default, prop, and context values, return the first provided of prop,
 * context, and default, in that order.
 */
export const preferProp = (
  def: boolean,
  prop?: boolean,
  context?: boolean,
  doNotFinalize?: boolean
): boolean =>
  !doNotFinalize
    ? def
      ? preferPropDefaultTrue(prop, context)
      : preferPropDefaultFalse(prop, context)
    : (prop ?? (context as boolean));

/**
 * For given default, prop, and context values, return the first provided of prop,
 * context, and default, in that order.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export const preferAnyProp = (def?: any, prop?: any, context?: any): any =>
  prop !== undefined && prop != null
    ? prop
    : context !== undefined && context != null
      ? context
      : def;

/**
 * For a given set of defaults, props, and context values, return the first provided of prop,
 * context, and default—in that order—for each property in the defaults object.
 */
export const preferFlagProps = (
  props: QueryBuilderFlags = {},
  contextVals: QueryBuilderFlags = {},
  finalize?: boolean
): QueryBuilderFlags =>
  objectEntries(queryBuilderFlagDefaults).reduce<QueryBuilderFlags>((acc, [key, def]) => {
    acc[key] = preferProp(def, props[key], contextVals[key], !finalize);
    return acc;
  }, {});
