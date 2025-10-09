import {
  defaultTranslations,
  mergeAnyTranslation,
  mergeAnyTranslations,
} from '@react-querybuilder/core';
import type { ReactNode } from 'react';
import type { Translations } from '../types';

/**
 * Merges any number of partial {@link Translations} into a single definition.
 */
export const mergeTranslations = (
  base: Partial<Translations>,
  ...otherTranslations: (Partial<Translations> | undefined)[]
): Partial<Translations> =>
  mergeAnyTranslations(
    base as Record<string, Record<string, unknown>>,
    ...(otherTranslations as (Record<string, Record<string, unknown>> | undefined)[])
  ) as Partial<Translations>;

export const mergeTranslation = (
  el: keyof Translations,
  keyPropContextMap: Record<string, [ReactNode, ReactNode]>,
  finalize?: boolean
): Record<string, Record<string, string>> | undefined =>
  mergeAnyTranslation(
    el,
    keyPropContextMap,
    finalize ? (defaultTranslations as Record<string, Record<string, string>>) : undefined
  ) as Record<string, Record<string, string>> | undefined;
