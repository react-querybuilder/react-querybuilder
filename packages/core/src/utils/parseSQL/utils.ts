import type { DefaultCombinatorNameExtended, DefaultOperatorName } from '../../types';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import type { ParseSQLOptions } from './parseSQL';
import type {
  AndOperator,
  ComparisonOperator,
  MixedAndXorOrList,
  OrOperator,
  SQLAndExpression,
  SQLExpression,
  SQLIdentifier,
  SQLLiteralValue,
  SQLOrExpression,
  SQLSignedNumberValue,
  SQLWhereObjectAny,
  SQLXorExpression,
  XorOperator,
} from './types';

export const isSQLLiteralValue = (v?: SQLWhereObjectAny): v is SQLLiteralValue =>
  v?.type === 'String' || v?.type === 'Number' || v?.type === 'Boolean';

export const isSQLSignedNumber = (v?: SQLWhereObjectAny): v is SQLSignedNumberValue =>
  v?.type === 'Prefix' && (v.prefix === '+' || v.prefix === '-') && v.value.type === 'Number';

export const isSQLLiteralOrSignedNumberValue = (
  v?: SQLWhereObjectAny
): v is SQLLiteralValue | SQLSignedNumberValue => isSQLLiteralValue(v) || isSQLSignedNumber(v);

export const isSQLIdentifier = (v?: SQLWhereObjectAny): v is SQLIdentifier =>
  v?.type === 'Identifier';

export const isWildcardsOnly = (sqlExpr: SQLExpression): boolean =>
  isSQLLiteralValue(sqlExpr) && sqlExpr.type === 'String' && /^["']?%+["']?$/.test(sqlExpr.value);

// oxlint-disable-next-line typescript/no-explicit-any
export const getParamString = (param: any): string => {
  switch (typeof param) {
    case 'number':
      return `${param}`;
    case 'boolean':
      return param ? 'TRUE' : 'FALSE';
    default:
      return `'${param}'`;
  }
};

export const getFieldName = (f: string | SQLIdentifier): string => {
  const fieldName = typeof f === 'string' ? f : f.value;

  if (fieldName.startsWith('`') && fieldName.endsWith('`')) {
    return fieldName.replaceAll(/(^`|`$)/g, '').replaceAll('``', '`');
  } else if (fieldName.startsWith('"') && fieldName.endsWith('"')) {
    return fieldName.replaceAll(/(^"|"$)/g, '').replaceAll('""', '"');
  } else if (fieldName.startsWith('[') && fieldName.endsWith(']')) {
    return fieldName.replaceAll(/(^\[|]$)/g, '').replaceAll(']]', ']');
  }

  return fieldName;
};

const normalizeCombinator = (c: AndOperator | OrOperator | XorOperator) =>
  lc(c.replace('&&', 'and').replace('||', 'or')) as DefaultCombinatorNameExtended;

export const normalizeOperator = (op: ComparisonOperator, flip?: boolean): DefaultOperatorName => {
  if (flip) {
    if (op === '<') return '>';
    if (op === '<=') return '>=';
    if (op === '>') return '<';
    if (op === '>=') return '<=';
  }
  if (op === '<>') return '!=';
  return op;
};

export const evalSQLLiteralValue = (
  valueObj: SQLLiteralValue | SQLSignedNumberValue,
  { bigIntOnOverflow }: ParseSQLOptions = {}
  // oxlint-disable-next-line typescript/no-explicit-any
): any => {
  if (valueObj.type === 'String') {
    const valueString: string = valueObj.value;
    if (
      (valueString.startsWith(`'`) && valueString.endsWith(`'`)) ||
      (valueString.startsWith(`"`) && valueString.endsWith(`"`))
    ) {
      const innerString = valueString.slice(1, -1);
      return innerString.replaceAll(/''/gm, "'");
    }
    // Theoretically we should never get here since all strings will be wrapped in
    // single or double quotes, but if we do get here we return the string as is.
    return valueString;
  } else if (valueObj.type === 'Boolean') {
    return lc(valueObj.value) === 'true';
  } else if (isSQLSignedNumber(valueObj)) {
    return parseNumber(`${valueObj.prefix}${valueObj.value.value}`, {
      parseNumbers: true,
      bigIntOnOverflow,
    });
  }
  return parseNumber(valueObj.value, { parseNumbers: true, bigIntOnOverflow });
};

export const generateFlatAndOrList = (
  expr: SQLAndExpression | SQLOrExpression | SQLXorExpression
): (DefaultCombinatorNameExtended | SQLExpression)[] => {
  const combinator = normalizeCombinator(expr.operator);
  if (
    expr.left.type === 'AndExpression' ||
    expr.left.type === 'OrExpression' ||
    expr.left.type === 'XorExpression'
  ) {
    return [...generateFlatAndOrList(expr.left), combinator, expr.right];
  }
  return [expr.left, combinator, expr.right];
};

export const generateMixedAndXorOrList = (
  expr: SQLAndExpression | SQLOrExpression | SQLXorExpression
): MixedAndXorOrList => {
  const arr = generateFlatAndOrList(expr);
  let currentLevel = 0;
  const orArray: MixedAndXorOrList = { combinator: 'or', expressions: [] };
  let xorArray: MixedAndXorOrList = { combinator: 'xor', expressions: [] };
  let andArray: MixedAndXorOrList = { combinator: 'and', expressions: [] };

  for (let i = 0; i < arr.length - 2; i += 2) {
    let levelDelta = 0;

    // istanbul ignore else
    if (arr[i + 1] === 'and') {
      levelDelta = 2 - currentLevel;
    } else if (arr[i + 1] === 'xor') {
      levelDelta = 1 - currentLevel;
    } else if (arr[i + 1] === 'or') {
      levelDelta = 0 - currentLevel;
    }

    if (levelDelta > 0) {
      for (let d = 0; d < levelDelta; d++) {
        currentLevel += 1;
        // istanbul ignore else
        if (currentLevel === 1) {
          xorArray = { combinator: 'xor', expressions: [] };
          if (levelDelta === 1) {
            xorArray.expressions.push(arr[i] as SQLExpression);
            if (i >= arr.length - 3 || arr[i + 3] === 'xor') {
              xorArray.expressions.push(arr[i + 2] as SQLExpression);
            }
          }
        } else if (currentLevel === 2) {
          andArray = { combinator: 'and', expressions: [] };
          andArray.expressions.push(arr[i] as SQLExpression, arr[i + 2] as SQLExpression);
        }
      }
    } else if (levelDelta < 0) {
      for (let d = 0; d > levelDelta; d--) {
        currentLevel -= 1;
        // istanbul ignore else
        if (currentLevel === 1) {
          xorArray.expressions.push(andArray);
          if (levelDelta === -1) {
            xorArray.expressions.push(arr[i + 2] as SQLExpression);
          }
        } else if (currentLevel === 0) {
          orArray.expressions.push(xorArray);
          if (i >= arr.length - 3) {
            orArray.expressions.push(arr[i + 2] as SQLExpression);
          }
        }
      }
    } else {
      // If here, then levelDelta === 0
      switch (currentLevel) {
        case 0: {
          if (i === 0 || (i > 3 && arr[i - 3] !== 'or')) {
            orArray.expressions.push(arr[i] as SQLExpression);
          }
          if (i >= arr.length - 3 || arr[i + 3] === 'or') {
            orArray.expressions.push(arr[i + 2] as SQLExpression);
          }
          break;
        }
        case 1: {
          xorArray.expressions.push(arr[i + 2] as SQLExpression);
          break;
        }
        case 2: {
          andArray.expressions.push(arr[i + 2] as SQLExpression);
          break;
        }
      }
    }
  }

  // Close up shop
  if (currentLevel === 2) {
    xorArray.expressions.push(andArray);
    currentLevel -= 1;
  }
  if (currentLevel === 1) {
    orArray.expressions.push(xorArray);
    currentLevel -= 1;
  }

  // Collapse single-element arrays, in case there are only AND, only XOR, or only XOR/AND combinators
  if (orArray.expressions.length === 1 && 'combinator' in orArray.expressions[0]) {
    return orArray.expressions[0].expressions.length === 1 &&
      'combinator' in orArray.expressions[0].expressions[0]
      ? (orArray.expressions[0].expressions[0] as MixedAndXorOrList)
      : (orArray.expressions[0] as MixedAndXorOrList);
  }

  const returnArray: MixedAndXorOrList = { combinator: 'or', expressions: [] };

  // Collapse multi-element arrays, in case XOR level is unnecessary
  for (const o of orArray.expressions) {
    if ('combinator' in o) {
      // If here, then o is an XOR structure
      if ('combinator' in o.expressions[0] && o.expressions.length === 1) {
        // If here, then o.expressions[0] is an AND structure
        // that should supplant its parent XOR structure
        returnArray.expressions.push(o.expressions[0]);
      } else {
        returnArray.expressions.push(o);
      }
    } else {
      returnArray.expressions.push(o);
    }
  }

  return returnArray;
};
