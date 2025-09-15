import { produce } from 'immer';
import type { ReactNode } from 'react';
import { defaultTranslations } from '../defaultControlElements';
import type { Translations } from '../types';
import { objectEntries, objectKeys } from './objectUtils';

/**
 * Merges any number of partial {@link Translations} into a single definition.
 */
export const mergeTranslations = (
  base: Partial<Translations>,
  ...otherTranslations: (Partial<Translations> | undefined)[]
): Partial<Translations> =>
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

export const mergeTranslation = (
  el: keyof Translations,
  keyPropContextMap: Record<string, [ReactNode, ReactNode]>,
  finalize?: boolean
): Record<string, Record<string, string>> | undefined => {
  type RSRSS = Record<string, Record<string, string>>;
  const finalKeys = objectEntries(keyPropContextMap)
    .map(([key, [pT, cT]]) => [
      key,
      pT ?? cT ?? ((finalize ? defaultTranslations : {}) as RSRSS)[el]?.[key],
    ])
    .filter(k => !!k[1]);
  return finalKeys.length > 0 ? { [el]: Object.fromEntries(finalKeys) } : undefined;
};
