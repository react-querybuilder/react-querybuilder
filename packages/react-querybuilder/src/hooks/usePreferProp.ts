import { useMemo } from 'react';

const preferPropDefaultTrue = (prop?: boolean, context?: boolean) =>
  prop === false ? false : prop ? true : context === false ? false : true;

const preferPropDefaultFalse = (prop?: boolean, context?: boolean) =>
  prop ? true : prop === false ? false : context ? true : false;

const preferProp = (def: boolean, prop?: boolean, context?: boolean) =>
  def ? preferPropDefaultTrue(prop, context) : preferPropDefaultFalse(prop, context);

export const usePreferProp = (def: boolean, prop?: boolean, context?: boolean) =>
  useMemo(() => preferProp(def, prop, context), [context, def, prop]);

export const usePreferAnyProp = (def?: any, prop?: any, context?: any) =>
  useMemo(
    () =>
      typeof prop !== 'undefined' && prop != null
        ? prop
        : typeof context !== 'undefined' && context != null
        ? context
        : def,
    [context, def, prop]
  );
