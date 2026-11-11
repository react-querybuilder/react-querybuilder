import type { ExportOperatorMap, NLTranslations } from 'react-querybuilder';
import { nlPostProcessor as esPostProcessor } from './nlPostProcessors/es';
import { nlPostProcessor as jaPostProcessor } from './nlPostProcessors/ja';
import { nlPostProcessor as koPostProcessor } from './nlPostProcessors/ko';

export interface NLLanguageConfig {
  label: string;
  wordOrder?: string;
  operatorMap?: ExportOperatorMap;
  translations?: NLTranslations;
  nlPostProcessor?: (output: string) => string;
}

export type NLLanguageCode = 'en' | 'ja' | 'es' | 'ko' | 'cy';

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
      null: 'nullである',
      notnull: 'nullではない',
      in: ['のいずれかである', 'と同じ値のいずれかである'],
      notin: ['のいずれでもない', 'と同じ値のいずれでもない'],
      between: '以下である',
      notbetween: '以下の範囲外である',
    },
    translations: {
      and: 'かつ',
      or: 'または',
      true: '真',
      false: '偽',
      ruleSeparator: '、',
      betweenAnd: '以上',
      afterSubject: 'が',
      afterObject: '',
      listSeparator: '、',
      groupSuffix: '',
      groupSuffix_not: 'ではない',
    },
    nlPostProcessor: jaPostProcessor,
  },
  es: {
    label: 'Español (Spanish)',
    operatorMap: {
      '=': ['es', 'es igual al valor de'],
      '!=': ['no es', 'no es igual al valor de'],
      '<': ['es menor que', 'es menor que el valor de'],
      '>': ['es mayor que', 'es mayor que el valor de'],
      '<=': ['es menor o igual a', 'es menor o igual al valor de'],
      '>=': ['es mayor o igual a', 'es mayor o igual al valor de'],
      contains: ['contiene', 'contiene el valor de'],
      beginswith: ['comienza con', 'comienza con el valor de'],
      endswith: ['termina con', 'termina con el valor de'],
      doesnotcontain: ['no contiene', 'no contiene el valor de'],
      doesnotbeginwith: ['no comienza con', 'no comienza con el valor de'],
      doesnotendwith: ['no termina con', 'no termina con el valor de'],
      null: 'es nulo',
      notnull: 'no es nulo',
      in: ['es uno de los valores', 'es igual a un valor en'],
      notin: ['no es ninguno de los valores', 'no es igual a ningún valor en'],
      between: ['está entre', 'está entre los valores de'],
      notbetween: ['no está entre', 'no está entre los valores de'],
    },
    translations: {
      and: 'y',
      or: 'o',
      true: 'verdadero',
      false: 'falso',
      groupSuffix: 'es verdadero',
      groupSuffix_not: 'no es verdadero',
      ruleSeparator: ' ',
      listSeparator: ', ',
    },
    nlPostProcessor: esPostProcessor,
  },
  ko: {
    label: '한국어 (Korean)',
    wordOrder: 'SOV',
    // Dual-form particles (이(가), 을(를), 과(와), (으)로) resolved by nlPostProcessor
    operatorMap: {
      '=': ['이다', '의 값과 같다'],
      '!=': ['이(가) 아니다', '의 값과 같지 않다'],
      '<': ['보다 작다', '의 값보다 작다'],
      '>': ['보다 크다', '의 값보다 크다'],
      '<=': [' 이하이다', '의 값 이하이다'],
      '>=': [' 이상이다', '의 값 이상이다'],
      contains: ['을(를) 포함한다', '의 값을 포함한다'],
      beginswith: ['(으)로 시작한다', '의 값으로 시작한다'],
      endswith: ['(으)로 끝난다', '의 값으로 끝난다'],
      doesnotcontain: ['을(를) 포함하지 않는다', '의 값을 포함하지 않는다'],
      doesnotbeginwith: ['(으)로 시작하지 않는다', '의 값으로 시작하지 않는다'],
      doesnotendwith: ['(으)로 끝나지 않는다', '의 값으로 끝나지 않는다'],
      null: 'null이다',
      notnull: 'null이 아니다',
      in: [' 중 하나이다', '의 값 중 하나이다'],
      notin: [' 중 어느 것도 아니다', '의 값 중 어느 것도 아니다'],
      between: [' 사이에 있다', '의 값 사이에 있다'],
      notbetween: [' 사이에 있지 않다', '의 값 사이에 있지 않다'],
    },
    translations: {
      and: '그리고',
      or: '또는',
      true: '참',
      false: '거짓',
      ruleSeparator: ', ',
      betweenAnd: '과(와)',
      afterSubject: '이(가) ',
      afterObject: '',
      listSeparator: ', ',
      groupSuffix: '',
      groupSuffix_not: '이(가) 거짓이다',
    },
    nlPostProcessor: koPostProcessor,
  },
  cy: {
    label: 'Cymraeg (Welsh)',
    wordOrder: 'VSO',
    operatorMap: {
      '=': ['yw', "yr un fath â'r gwerth yn"],
      '!=': ['nid yw', "ddim yr un fath â'r gwerth yn"],
      '<': ['yn llai na', "yn llai na'r gwerth yn"],
      '>': ['yn fwy na', "yn fwy na'r gwerth yn"],
      '<=': ["yn llai na neu'n hafal i", "yn llai na neu'n hafal i'r gwerth yn"],
      '>=': ["yn fwy na neu'n hafal i", "yn fwy na neu'n hafal i'r gwerth yn"],
      contains: ['yn cynnwys', 'yn cynnwys y gwerth yn'],
      beginswith: ['yn dechrau gyda', "yn dechrau gyda'r gwerth yn"],
      endswith: ['yn gorffen gyda', "yn gorffen gyda'r gwerth yn"],
      doesnotcontain: ['ddim yn cynnwys', 'ddim yn cynnwys y gwerth yn'],
      doesnotbeginwith: ['ddim yn dechrau gyda', "ddim yn dechrau gyda'r gwerth yn"],
      doesnotendwith: ['ddim yn gorffen gyda', "ddim yn gorffen gyda'r gwerth yn"],
      null: 'yn null',
      notnull: 'ddim yn null',
      in: ["yn un o'r gwerthoedd", "yr un fath ag un o'r gwerthoedd yn"],
      notin: ["ddim yn un o'r gwerthoedd", 'ddim yr un fath ag unrhyw werth yn'],
      between: ['rhwng', 'rhwng y gwerthoedd yn'],
      notbetween: ['ddim rhwng', 'ddim rhwng y gwerthoedd yn'],
    },
    translations: {
      and: 'a',
      or: 'neu',
      true: 'gwir',
      false: 'gau',
      betweenAnd: 'a',
      groupSuffix: 'yn wir',
      groupSuffix_not: 'ddim yn wir',
    },
  },
};

export const nlLanguageCodes = Object.keys(nlLanguageConfigs) as NLLanguageCode[];
