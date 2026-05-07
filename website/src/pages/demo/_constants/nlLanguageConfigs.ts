import type { ExportOperatorMap, NLTranslations } from 'react-querybuilder';

export interface NLLanguageConfig {
  label: string;
  wordOrder?: string;
  operatorMap?: ExportOperatorMap;
  translations?: NLTranslations;
}

export type NLLanguageCode = 'en' | 'ja';

export const nlLanguageConfigs: Record<NLLanguageCode, NLLanguageConfig> = {
  en: {
    label: 'English',
  },
  ja: {
    label: '日本語 (Japanese)',
    wordOrder: 'SOV',
    operatorMap: {
      '=': ['である', 'と同じ値である'],
      '!=': ['ではない', 'と同じ値ではない'],
      '<': ['より小さい', 'の値より小さい'],
      '>': ['より大きい', 'の値より大きい'],
      '<=': ['以下である', 'の値以下である'],
      '>=': ['以上である', 'の値以上である'],
      contains: ['を含む', 'の値を含む'],
      beginswith: ['で始まる', 'の値で始まる'],
      endswith: ['で終わる', 'の値で終わる'],
      doesnotcontain: ['を含まない', 'の値を含まない'],
      doesnotbeginwith: ['で始まらない', 'の値で始まらない'],
      doesnotendwith: ['で終わらない', 'の値で終わらない'],
      null: 'はnullである',
      notnull: 'はnullではない',
      in: ['のいずれかである', 'と同じ値のいずれかである'],
      notin: ['のいずれでもない', 'と同じ値のいずれでもない'],
      between: ['の間である', 'の値の間である'],
      notbetween: ['の間ではない', 'の値の間ではない'],
    },
    translations: {
      and: 'かつ',
      or: 'または',
      true: '真',
      false: '偽',
      ruleSeparator: '、',
      betweenAnd: 'と',
      groupSuffix: 'は真である',
      groupSuffix_not: 'は真ではない',
    },
  },
};

export const nlLanguageCodes = Object.keys(nlLanguageConfigs) as NLLanguageCode[];
