import { produce } from 'immer';
import type { Translations } from '../types';
import { objectKeys } from './objectUtils';

const defaultTranslationsBase: Partial<Translations> = {};

/**
 * Merges any number of partial {@link Translations} into a single definition.
 */
export const mergeTranslations = (
  ...args: (Partial<Translations> | undefined)[]
): Partial<Translations> => {
  const [base, ...otherTranslations] = args;

  return produce(base ?? defaultTranslationsBase, draft => {
    for (const translations of otherTranslations) {
      if (!translations) continue;
      objectKeys(translations).forEach(t => {
        draft[t] = { ...draft[t], ...translations[t] };
      });
    }
  });
};
