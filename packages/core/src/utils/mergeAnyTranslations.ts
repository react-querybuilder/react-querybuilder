import { objectEntries, objectKeys } from '@react-querybuilder/core';
import { produce } from 'immer';

/**
 * Merges any number of partial translations into a single definition.
 */
export const mergeAnyTranslations = (
  base: Record<string, Record<string, unknown>>,
  ...otherTranslations: (Record<string, Record<string, unknown>> | undefined)[]
): Record<string, Record<string, unknown>> =>
  produce(base, draft => {
    for (const translations of otherTranslations) {
      // istanbul ignore else
      if (translations) {
        for (const t of objectKeys(translations)) {
          if (draft[t]) {
            Object.assign(draft[t], translations[t]);
          } else {
            Object.assign(draft, { [t]: translations[t] });
          }
        }
      }
    }
  });

export const mergeAnyTranslation = (
  el: string,
  keyPropContextMap: Record<string, [unknown, unknown]>,
  defaults?: Record<string, Record<string, unknown>>
): Record<string, Record<string, unknown>> | undefined => {
  const finalKeys = objectEntries(keyPropContextMap)
    .map(([key, [pT, cT]]) => [key, pT ?? cT ?? defaults?.[el]?.[key]])
    .filter(k => !!k[1]);
  if (finalKeys.length > 0 || defaults) {
    const defaultProperties = defaults?.[el] ?? {};
    const finalObject = Object.assign(defaultProperties, Object.fromEntries(finalKeys));
    return { [el]: finalObject };
  }
  return undefined;
};
