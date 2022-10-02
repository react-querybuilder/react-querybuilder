import type {
  DefaultCombinatorNameExtended,
  DefaultOperatorName,
} from '@react-querybuilder/ts/dist/types/src/index.noReact';
import type {
  AndList,
  AndOperator,
  ComparisonOperator,
  GenerateMixedAndXorOrListReturn,
  MixedAndXorList,
  MixedAndXorOrList,
  OrOperator,
  SQLAndExpression,
  SQLExpression,
  SQLIdentifier,
  SQLLiteralValue,
  SQLOrExpression,
  SQLWhereObjectAny,
  SQLXorExpression,
  XorOperator,
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

const normalizeCombinator = (c: AndOperator | OrOperator | XorOperator) =>
  c.replace('&&', 'and').replace('||', 'or').toLowerCase() as DefaultCombinatorNameExtended;

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

export const generateMixedAndOrList = (
  expr: SQLAndExpression | SQLOrExpression | SQLXorExpression
) => {
  const arr = generateFlatAndOrList(expr);
  const returnArray: (DefaultCombinatorNameExtended | SQLExpression | ('and' | SQLExpression)[])[] =
    [];
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
    } else if (arr[i + 1] === 'or' || arr[i + 1] === 'xor') {
      if (i === 0 || i === arr.length - 3) {
        if (i === 0 || arr[i - 1] === 'or' || arr[i - 1] === 'xor') {
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

export const generateMixedAndXorOrList = (
  expr: SQLAndExpression | SQLOrExpression | SQLXorExpression
): GenerateMixedAndXorOrListReturn => {
  const arr = generateFlatAndOrList(expr);
  let currentLevel = 0;
  const orArray: MixedAndXorOrList = [];
  let xorArray: MixedAndXorList = [];
  let andArray: AndList = [];

  for (let i = 0; i < arr.length - 2; i += 2) {
    let levelDelta = 0;

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
        if (currentLevel === 1) {
          xorArray = [];
          if (levelDelta === 1) {
            xorArray.push(arr[i] as SQLExpression, arr[i + 2] as SQLExpression);
          }
        } else if (currentLevel === 2) {
          andArray = [];
          andArray.push(arr[i] as SQLExpression, arr[i + 2] as SQLExpression);
        }
      }
    } else if (levelDelta < 0) {
      for (let d = 0; d > levelDelta; d--) {
        currentLevel -= 1;
        if (currentLevel === 1) {
          xorArray.push(andArray);
          if (levelDelta === -1) {
            xorArray.push(arr[i + 2] as SQLExpression);
          }
        } else if (currentLevel === 0) {
          orArray.push(xorArray);
          orArray.push(arr[i + 2] as SQLExpression);
        }
      }
    } else {
      // levelDelta === 0
      if (currentLevel === 0) {
        if (i === 0) {
          orArray.push(arr[i] as SQLExpression);
        }
        orArray.push(arr[i + 2] as SQLExpression);
      } else if (currentLevel === 1) {
        xorArray.push(arr[i + 2] as SQLExpression);
      } else if (currentLevel === 2) {
        andArray.push(arr[i + 2] as SQLExpression);
      }
    }
  }

  // Close up
  if (currentLevel === 2) {
    xorArray.push(andArray);
    currentLevel -= 1;
  }
  if (currentLevel === 1) {
    orArray.push(xorArray);
    currentLevel -= 1;
  }

  // Collapse single-element arrays
  if (orArray.length === 1 && Array.isArray(orArray[0])) {
    if (orArray[0].length === 1 && Array.isArray(orArray[0][0])) {
      const retArr: GenerateMixedAndXorOrListReturn = orArray[0][0];
      retArr.combinator = 'and';
      return retArr;
    } else {
      const retArr: GenerateMixedAndXorOrListReturn = orArray[0];
      retArr.combinator = 'xor';
      return retArr;
    }
  }

  const returnArray: GenerateMixedAndXorOrListReturn = [];
  returnArray.combinator = 'or';

  for (const o of orArray) {
    if (Array.isArray(o)) {
      if (o.length === 1 && Array.isArray(o[0])) {
        returnArray.push(o[0]);
        (returnArray[0] as AndList).combinator = 'and';
      } else {
        o.combinator = 'xor';
        returnArray.push(
          ...o.map(ox => {
            if (Array.isArray(ox)) {
              ox.combinator = 'and';
            }
            return ox;
          })
        );
      }
    } else {
      returnArray.push(o);
    }
  }

  return returnArray;
};
