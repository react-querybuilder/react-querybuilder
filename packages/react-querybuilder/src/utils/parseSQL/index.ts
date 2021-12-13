import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleType,
  ParseSQLOptions,
} from '../../types';
import sqlParser from './sqlParser';
import type {
  AndOperator,
  ComparisonOperator,
  OrOperator,
  SQLAndExpression,
  SQLExpression,
  SQLIdentifier,
  SQLLiteralValue,
  SQLOrExpression,
} from './types';
import { isSQLExpressionNotString, isSQLIdentifier, isSQLLiteralValue } from './utils';

const getParamString = (param: any) => {
  switch (typeof param) {
    case 'number':
      return `${param}`;
    case 'boolean':
      return param ? 'TRUE' : 'FALSE';
    default:
      return `'${param}'`;
  }
};

const getFieldName = (f: string) => f.replace(/(^`|`$)/g, '');

const normalizeCombinator = (c: AndOperator | OrOperator) =>
  c.replace('&&', 'and').replace('||', 'or').toLowerCase() as DefaultCombinatorName;

const normalizeOperator = (op: ComparisonOperator) => op.replace('<>', '!=') as DefaultOperatorName;

const evalSQLLiteralValue = (valueObj: SQLLiteralValue) =>
  valueObj.type === 'String'
    ? valueObj.value.replace(/(^'|'$)/g, '').replace(/(^"|"$)/g, '')
    : valueObj.type === 'Boolean'
    ? valueObj.value.toLowerCase() === 'true'
    : parseFloat(valueObj.value);

const generateFlatAndOrList = (
  expr: SQLAndExpression | SQLOrExpression
): (DefaultCombinatorName | SQLExpression)[] => {
  const combinator = normalizeCombinator(expr.operator);
  if (expr.left.type === 'AndExpression' || expr.left.type === 'OrExpression') {
    return [...generateFlatAndOrList(expr.left), combinator, expr.right];
  }
  return [expr.left, combinator, expr.right];
};

const generateMixedAndOrList = (expr: SQLAndExpression | SQLOrExpression) => {
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

const parseSQL = (sql: string, options?: ParseSQLOptions): DefaultRuleGroupTypeAny => {
  let sqlString = /^[ \t\n\r]*SELECT\b/i.test(sql) ? sql : `SELECT * FROM t WHERE ${sql}`;
  let ic = false;
  if (options) {
    const { params, paramPrefix, independentCombinators } = options;
    ic = independentCombinators || false;
    /* istanbul ignore else */
    if (params) {
      if (Array.isArray(params)) {
        let i = 0;
        sqlString = sqlString.replace(/\?/g, () => {
          const paramString = getParamString(params[i]);
          i++;
          return paramString;
        });
      } else {
        const keys = Object.keys(params);
        const prefix = paramPrefix ?? ':';
        keys.forEach(p => {
          sqlString = sqlString.replace(
            new RegExp(`\\${prefix}${p}\\b`, 'ig'),
            getParamString(params[p])
          );
        });
      }
    }
  }

  const processSQLExpression = (
    expr: SQLExpression
  ): DefaultRuleType | DefaultRuleGroupTypeAny | null => {
    if (expr.type === 'NotExpression') {
      const val =
        expr.value.type === 'SimpleExprParentheses' ? expr.value.value.value[0] : expr.value;
      const rule = processSQLExpression(val);
      /* instanbul ignore else */
      if (rule) {
        if ('rules' in rule) {
          return { ...rule, not: true };
        }
        return { combinator: 'and', rules: [rule], not: true };
      }
    } else if (expr.type === 'SimpleExprParentheses') {
      const ex = expr.value.value[0];
      if (ex.type === 'AndExpression' || ex.type === 'OrExpression') {
        return processSQLExpression(ex);
      }
      const rule = processSQLExpression(ex) as DefaultRuleType;
      return rule ? { combinator: 'and', rules: [rule] } : null;
    } else if (expr.type === 'AndExpression' || expr.type === 'OrExpression') {
      if (ic) {
        const andOrList = generateFlatAndOrList(expr);
        const rules = andOrList.map(v => {
          if (typeof v === 'string') {
            return v;
          }
          return processSQLExpression(v);
        });
        // Bail out completely if any rules in the list were invalid
        // so as not to return an incorrect and/or sequence
        if (rules.includes(null)) {
          return null;
        }
        return {
          rules: rules as DefaultRuleGroupICArray,
        };
      }
      const andOrList = generateMixedAndOrList(expr);
      const combinator = andOrList[1] as DefaultCombinatorName;
      const filteredList = andOrList
        .filter(v => Array.isArray(v) || isSQLExpressionNotString(v))
        .map(v => (Array.isArray(v) ? v.filter(isSQLExpressionNotString) : v)) as (
        | SQLExpression
        | SQLExpression[]
      )[];
      const rules = filteredList
        .map((exp): DefaultRuleGroupType | DefaultRuleType | null => {
          if (Array.isArray(exp)) {
            return {
              combinator: 'and',
              rules: exp
                .map(e => processSQLExpression(e))
                .filter(r => !!r) as DefaultRuleGroupArray,
            };
          }
          return processSQLExpression(exp) as DefaultRuleType | DefaultRuleGroupType | null;
        })
        .filter(r => !!r) as DefaultRuleGroupArray;
      /* istanbul ignore else */
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (expr.type === 'IsNullBooleanPrimary') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.value)) {
        return {
          field: getFieldName(expr.value.value),
          operator: expr.hasNot ? 'notNull' : 'null',
          value: null,
        };
      }
    } else if (expr.type === 'ComparisonBooleanPrimary') {
      /* istanbul ignore else */
      if (
        (isSQLIdentifier(expr.left) && !isSQLIdentifier(expr.right)) ||
        (!isSQLIdentifier(expr.left) && isSQLIdentifier(expr.right))
      ) {
        const identifier = isSQLIdentifier(expr.left)
          ? expr.left.value
          : (expr.right as SQLIdentifier).value;
        const valueObj = [expr.left, expr.right].find(t => !isSQLIdentifier(t));
        if (isSQLLiteralValue(valueObj)) {
          return {
            field: getFieldName(identifier),
            operator: normalizeOperator(expr.operator),
            value: evalSQLLiteralValue(valueObj),
          };
        }
      }
    } else if (expr.type === 'InExpressionListPredicate') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.left)) {
        const valueArray = expr.right.value.filter(isSQLLiteralValue).map(evalSQLLiteralValue);
        const value = options?.listsAsArrays ? valueArray : valueArray.join(', ');
        const operator = expr.hasNot ? 'notIn' : 'in';
        return { field: getFieldName(expr.left.value), operator, value };
      }
    } else if (expr.type === 'BetweenPredicate') {
      /* istanbul ignore else */
      if (
        isSQLIdentifier(expr.left) &&
        isSQLLiteralValue(expr.right.left) &&
        isSQLLiteralValue(expr.right.right)
      ) {
        const valueArray = [expr.right.left, expr.right.right].map(evalSQLLiteralValue);
        const value = options?.listsAsArrays ? valueArray : valueArray.join(', ');
        const operator = expr.hasNot ? 'notBetween' : 'between';
        return { field: getFieldName(expr.left.value), operator, value };
      }
    } else if (expr.type === 'LikePredicate') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.left) && expr.right.type === 'String') {
        const valueWithWildcards = evalSQLLiteralValue(expr.right) as string;
        const valueWithoutWildcards = valueWithWildcards.replace(/(^%)|(%$)/g, '');
        let operator: DefaultOperatorName = '=';
        /* istanbul ignore else */
        if (/^%.*%$/.test(valueWithWildcards)) {
          operator = expr.hasNot ? 'doesNotContain' : 'contains';
        } else if (/%$/.test(valueWithWildcards)) {
          operator = expr.hasNot ? 'doesNotBeginWith' : 'beginsWith';
        } else if (/^%/.test(valueWithWildcards)) {
          operator = expr.hasNot ? 'doesNotEndWith' : 'endsWith';
        }
        return { field: getFieldName(expr.left.value), operator, value: valueWithoutWildcards };
      }
    }
    return null;
  };

  const { where } = sqlParser.parse(sqlString).value;
  if (where) {
    const result = processSQLExpression(where);
    if (result) {
      if ('rules' in result) {
        return result;
      }
      return { combinator: 'and', rules: [result] };
    }
  }
  return { combinator: 'and', rules: [] };
};

export default parseSQL;
