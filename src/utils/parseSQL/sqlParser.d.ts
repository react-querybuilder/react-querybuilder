import type { ParsedSQL } from './types';

export function parse(input: string): ParsedSQL;
export const yy: Record<string, unknown>;
export function trace(): void;
export const symbols_: { name: number };
export const terminals_: { [k: number]: string };
export const productions_: any[];
export function performAction(
  yytext: string,
  yyleng: number,
  yylineno: number,
  yy: Record<string, unknown>,
  yystate: number,
  $$: any[],
  _$: Record<string, unknown>
): void;
export const table: any[];
export const defaultActions: Record<string, unknown>;
export function parseError(str: string, hash: Record<string, unknown>): any;
