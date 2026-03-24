import { objectEntries, objectKeys } from './objectUtils';

const isUnsafeKey = (key: string): boolean =>
  key === '__proto__' || key === 'constructor' || key === 'prototype';

/**
 * Merges any number of partial translations into a single definition.
 */
export const mergeAnyTranslations = (
  base: Record<string, Record<string, unknown>>,
  ...otherTranslations: (Record<string, Record<string, unknown>> | undefined)[]
): Record<string, Record<string, unknown>> => {
  const result = { ...base };

  for (const translations of otherTranslations) {
    // istanbul ignore else
    if (translations) {
      for (const key of objectKeys(translations)) {
        if (isUnsafeKey(key)) continue;
        if (result[key]) {
          result[key] = { ...result[key], ...translations[key] };
        } else {
          result[key] = { ...translations[key] };
        }
      }
    }
  }

  return result;
};

export const mergeAnyTranslation = (
  el: string,
  keyPropContextMap: Record<string, [unknown, unknown]>,
  defaults?: Record<string, Record<string, unknown>>
): Record<string, Record<string, unknown>> | undefined => {
  if (isUnsafeKey(el)) return undefined;
  const finalKeys = objectEntries(keyPropContextMap)
    .map(([key, [pT, cT]]) => [key, pT ?? cT ?? defaults?.[el]?.[key]])
    .filter(k => !isUnsafeKey(k[0] as string) && !!k[1]);
  if (finalKeys.length > 0 || defaults) {
    const defaultProperties = defaults?.[el] ?? {};
    const finalObject = Object.assign({}, defaultProperties, Object.fromEntries(finalKeys));
    return { [el]: finalObject };
  }
  return undefined;
};
