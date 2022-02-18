import type { ParsedSQL } from './types';

export declare namespace sqlParser {
  function parse(input: string): ParsedSQL;
}
