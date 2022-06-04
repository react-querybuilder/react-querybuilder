import type { DefaultCombinatorName, DefaultOperatorName } from '../../types/index.noReact';
import type {
  AndOperator,
  ComparisonOperator,
  OrOperator,
  SQLAndExpression,
  SQLExpression,
  SQLIdentifier,
  SQLLiteralValue,
  SQLOrExpression,
  SQLWhereObjectAny,
} from './types';

export const isSQLExpressionNotString = (v?: string | SQLExpression): v is SQLExpression =>
  !!v && typeof v !== 'string';

export const isSQLLiteralValue = (v?: SQLWhereObjectAny): v is SQLLiteralValue =>
  !!v && (v.type === 'String' || v.type === 'Number' || v.type === 'Boolean');

export const isSQLIdentifier = (v?: SQLWhereObjectAny): v is SQLIdentifier =>
  !!v && v.type === 'Identifier';

export const isWildcardsOnly = (sqlExpr: SQLExpression) =>
  isSQLLiteralValue(sqlExpr) && sqlExpr.type === 'String' && /^['"]?%+['"]?$/.test(sqlExpr.value);

export const getParamString = (param: any) => {
  switch (typeof param) {
    case 'number':
      return `${param}`;
    case 'boolean':
      return param ? 'TRUE' : 'FALSE';
    default:
      return `'${param}'`;
  }
};

export const getFieldName = (f: string | SQLIdentifier) =>
  (typeof f === 'string' ? f : f.value).replace(/(^`|`$)/g, '');

const normalizeCombinator = (c: AndOperator | OrOperator) =>
  c.replace('&&', 'and').replace('||', 'or').toLowerCase() as DefaultCombinatorName;

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

export const evalSQLLiteralValue = (valueObj: SQLLiteralValue) =>
  valueObj.type === 'String'
    ? valueObj.value.replace(/^(['"]?)(.+?)\1$/, '$2')
    : valueObj.type === 'Boolean'
    ? valueObj.value.toLowerCase() === 'true'
    : parseFloat(valueObj.value);

export const generateFlatAndOrList = (
  expr: SQLAndExpression | SQLOrExpression
): (DefaultCombinatorName | SQLExpression)[] => {
  const combinator = normalizeCombinator(expr.operator);
  if (expr.left.type === 'AndExpression' || expr.left.type === 'OrExpression') {
    return [...generateFlatAndOrList(expr.left), combinator, expr.right];
  }
  return [expr.left, combinator, expr.right];
};

export const generateMixedAndOrList = (expr: SQLAndExpression | SQLOrExpression) => {
  const arr = generateFlatAndOrList(expr);
  const returnArray: (DefaultCombinatorName | SQLExpression | ('and' | SQLExpression)[])[] = [];
  let startIndex = 0;
  for (let i = 0; i < arr.length; i += 2) {
    if (arr[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (arr[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      const tempAndArray = arr.slice(startIndex, i + 1) as ('and' | SQLExpression)[];
      returnArray.push(tempAndArray);
      i -= 2;
    } else if (arr[i + 1] === 'or') {
      if (i === 0 || i === arr.length - 3) {
        if (i === 0 || arr[i - 1] === 'or') {
          returnArray.push(arr[i]);
        }
        returnArray.push(arr[i + 1]);
        if (i === arr.length - 3) {
          returnArray.push(arr[i + 2]);
        }
      } else {
        if (arr[i - 1] === 'and') {
          returnArray.push(arr[i + 1]);
        } else {
          returnArray.push(arr[i]);
          returnArray.push(arr[i + 1]);
        }
      }
    }
  }
  if (returnArray.length === 1 && Array.isArray(returnArray[0])) {
    // If length is 1, then the only element is an AND array so just return that
    return returnArray[0];
  }
  return returnArray;
};
