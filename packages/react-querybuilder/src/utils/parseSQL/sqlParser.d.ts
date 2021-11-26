import type { ParsedSQL } from './types';

declare namespace sqlParser {
  function parse(input: string): ParsedSQL;
}

export default sqlParser;
