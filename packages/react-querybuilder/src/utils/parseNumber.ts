import type { ParseNumbersMethod } from '@react-querybuilder/ts/src/index.noReact';
import { numericRegex } from '../internal';

interface ParseNumberOptions {
  parseNumbers?: ParseNumbersMethod;
}

export const parseNumber = (v: any, { parseNumbers }: ParseNumberOptions) => {
  if (typeof v === 'bigint' || typeof v === 'number') {
    return v;
  }
  return parseNumbers && (parseNumbers === 'native' || numericRegex.test(v)) ? parseFloat(v) : v;
};
