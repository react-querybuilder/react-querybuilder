import type {
  DefaultCombinatorName,
  RuleGroupTypeAny,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '@react-querybuilder/ts/src/index.noReact';

export const numericRegex = /^\s*[+-]?(\d+|\d*\.\d+|\d+\.\d*)([Ee][+-]?\d+)?\s*$/;

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

export const celCombinatorMap: Record<DefaultCombinatorName, '&&' | '||'> = {
  and: '&&',
  or: '||',
};

/**
 * Register these operators with jsonLogic before applying the
 * result of formatQuery(query, 'jsonlogic').
 *
 * @example
 * for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
 *   jsonLogic.add_operation(op, func);
 * }
 * jsonLogic.apply({ "startsWith": [{ "var": "firstName" }, "Stev"] }, data);
 */
export const jsonLogicAdditionalOperators: Record<
  'startsWith' | 'endsWith',
  (...args: any[]) => boolean
> = {
  startsWith: (a: string, b: string) => a.startsWith(b),
  endsWith: (a: string, b: string) => a.endsWith(b),
};

export const numerifyValues = (rg: RuleGroupTypeAny): RuleGroupTypeAny => ({
  ...rg,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error TS can't keep track of odd/even indexes here
  rules: rg.rules.map(r => {
    if (typeof r === 'string') {
      return r;
    } else if ('rules' in r) {
      return numerifyValues(r);
    }
    let { value } = r;
    if (typeof value === 'string' && numericRegex.test(value)) {
      value = parseFloat(value);
    }
    // if (toArray(value).length > 1) {
    //   return { ...r, value };
    // }
    // if (typeof value === 'number' && !isNaN(value)) {
    //   return { ...r, value };
    // }
    return { ...r, value };
  }),
});

export const isValidValue = (v: any) =>
  (typeof v === 'string' && v.length > 0) ||
  (typeof v === 'number' && !isNaN(v)) ||
  (typeof v !== 'string' && typeof v !== 'number');

export const shouldRenderAsNumber = (v: any, parseNumbers?: boolean) =>
  !!parseNumbers &&
  (typeof v === 'number' ||
    typeof v === 'bigint' ||
    (typeof v === 'string' && numericRegex.test(v)));

export const isValueProcessorLegacy = (
  vp: ValueProcessorLegacy | ValueProcessorByRule
): vp is ValueProcessorLegacy => vp.length >= 3;
