import { produce } from 'immer';
import type { Translations } from '../types';
import { objectKeys } from './objectUtils';

const defaultTranslationsBase: Partial<Translations> = {};

/**
 * Merges any number of partial {@link Translations} into a single definition.
 */
export const mergeTranslations = (
  base?: Partial<Translations>,
  ...otherTranslations: (Partial<Translations> | undefined)[]
): Partial<Translations> =>
  produce(base ?? defaultTranslationsBase, draft => {
    for (const translations of otherTranslations) {
      if (translations) {
        objectKeys(translations).forEach(t => {
          if (!draft[t]) {
            Object.assign(draft, { [t]: translations[t] });
          } else {
            Object.assign(draft[t]!, translations[t]);
          }
        });
      }
    }
  });
