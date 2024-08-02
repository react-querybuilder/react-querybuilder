import type {
  DefaultCombinatorName,
  RuleGroupTypeAny,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { numericRegex } from '../misc';
import { parseNumber } from '../parseNumber';

export const mapSQLOperator = (op: string) => {
  switch (op.toLowerCase()) {
    case 'null':
      return 'is null';
    case 'notnull':
      return 'is not null';
    case 'notin':
      return 'not in';
    case 'notbetween':
      return 'not between';
    case 'contains':
    case 'beginswith':
    case 'endswith':
      return 'like';
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith':
      return 'not like';
    default:
      return op;
  }
};

export const mongoOperators = {
  '=': '$eq',
  '!=': '$ne',
  '<': '$lt',
  '<=': '$lte',
  '>': '$gt',
  '>=': '$gte',
  in: '$in',
  notIn: '$nin',
};

export const celCombinatorMap = {
  and: '&&',
  or: '||',
} satisfies Record<DefaultCombinatorName, '&&' | '||'>;

/**
 * Register these operators with `jsonLogic` before applying the result
 * of `formatQuery(query, 'jsonlogic')`.
 *
 * @example
 * ```
 * for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
 *   jsonLogic.add_operation(op, func);
 * }
 * jsonLogic.apply({ "startsWith": [{ "var": "firstName" }, "Stev"] }, data);
 * ```
 */
export const jsonLogicAdditionalOperators = {
  startsWith: (a: string, b: string) => typeof a === 'string' && a.startsWith(b),
  endsWith: (a: string, b: string) => typeof a === 'string' && a.endsWith(b),
} satisfies Record<'startsWith' | 'endsWith', (a: string, b: string) => boolean>;

export const numerifyValues = (rg: RuleGroupTypeAny): RuleGroupTypeAny => ({
  ...rg,
  // @ts-expect-error TS doesn't keep track of odd/even indexes here
  rules: rg.rules.map(r => {
    if (typeof r === 'string') {
      return r;
    }

    if (isRuleGroup(r)) {
      return numerifyValues(r);
    }

    if (Array.isArray(r.value)) {
      return { ...r, value: r.value.map(v => parseNumber(v, { parseNumbers: true })) };
    }

    const va = toArray(r.value).map(v => parseNumber(v, { parseNumbers: true }));
    if (va.every(v => typeof v === 'number')) {
      // istanbul ignore else
      if (va.length > 1) {
        return { ...r, value: va };
      } else if (va.length === 1) {
        return { ...r, value: va[0] };
      }
    }

    return r;
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValidValue = (v: any) =>
  (typeof v === 'string' && v.length > 0) ||
  (typeof v === 'number' && !isNaN(v)) ||
  (typeof v !== 'string' && typeof v !== 'number');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shouldRenderAsNumber = (v: any, parseNumbers?: boolean) =>
  parseNumbers &&
  (typeof v === 'number' ||
    typeof v === 'bigint' ||
    (typeof v === 'string' && numericRegex.test(v)));

export const isValueProcessorLegacy = (
  vp: ValueProcessorLegacy | ValueProcessorByRule
): vp is ValueProcessorLegacy => vp.length >= 3;

export const quoteFieldNamesWithArray = (
  quoteFieldNamesWith: null | string | [string, string] = ['', '']
): [string, string] =>
  Array.isArray(quoteFieldNamesWith)
    ? quoteFieldNamesWith
    : typeof quoteFieldNamesWith === 'string'
      ? [quoteFieldNamesWith, quoteFieldNamesWith]
      : quoteFieldNamesWith ?? ['', ''];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nullOrUndefinedOrEmpty = (v: any) =>
  v === null || typeof v === 'undefined' || v === '';
