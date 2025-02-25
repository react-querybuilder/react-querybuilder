const preferPropDefaultTrue = (prop?: boolean, context?: boolean) =>
  prop === false ? false : prop ? true : context === false ? false : true;

const preferPropDefaultFalse = (prop?: boolean, context?: boolean) =>
  prop ? true : prop === false ? false : context ? true : false;

export const preferProp = (def: boolean, prop?: boolean, context?: boolean): boolean =>
  def ? preferPropDefaultTrue(prop, context) : preferPropDefaultFalse(prop, context);

/**
 * For given default, prop, and context values, return the first provided of prop,
 * context, and default, in that order.
 *
 * @group Hooks
 */
export const usePreferProp = (def: boolean, prop?: boolean, context?: boolean): boolean =>
  preferProp(def, prop, context);

/**
 * For given default, prop, and context values, return the first provided of prop,
 * context, and default, in that order.
 *
 * @group Hooks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usePreferAnyProp = (def?: any, prop?: any, context?: any): any =>
  prop !== undefined && prop != null
    ? prop
    : context !== undefined && context != null
      ? context
      : def;
