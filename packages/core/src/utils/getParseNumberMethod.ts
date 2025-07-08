import type { InputType, ParseNumberMethod, ParseNumbersPropConfig } from '../types';

export const getParseNumberMethod = ({
  parseNumbers,
  inputType,
}: {
  parseNumbers?: ParseNumbersPropConfig;
  inputType?: InputType | null;
}): ParseNumberMethod => {
  if (typeof parseNumbers === 'string') {
    const [method, level] = parseNumbers.split('-') as
      | [ParseNumberMethod, 'limited']
      | [ParseNumberMethod];
    if (level === 'limited') {
      return inputType === 'number' ? method : false;
    }

    return method;
  }

  return parseNumbers ? 'strict' : false;
};
