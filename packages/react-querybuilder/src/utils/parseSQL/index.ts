import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ParseSQLOptions,
} from '../../types';
import sqlParser from './sqlParser';
import type { SQLExpression, SQLIdentifier } from './types';
import {
  evalSQLLiteralValue,
  generateFlatAndOrList,
  generateMixedAndOrList,
  getFieldName,
  getParamString,
  isSQLExpressionNotString,
  isSQLIdentifier,
  isSQLLiteralValue,
  normalizeOperator,
} from './utils';

/**
 * Converts a SQL `SELECT` statement into a query suitable for
 * the QueryBuilder component's `query` or `defaultQuery` props.
 */
function parseSQL(sql: string): DefaultRuleGroupType;
function parseSQL(
  sql: string,
  options: Omit<ParseSQLOptions, 'independentCombinators'> & { independentCombinators?: false }
): DefaultRuleGroupType;
function parseSQL(
  sql: string,
  options: Omit<ParseSQLOptions, 'independentCombinators'> & { independentCombinators: true }
): DefaultRuleGroupTypeIC;
function parseSQL(sql: string, options?: ParseSQLOptions): DefaultRuleGroupTypeAny {
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
        return { rules: [rule], not: true, ...(ic ? {} : { combinator: 'and' }) };
      }
    } else if (expr.type === 'SimpleExprParentheses') {
      const ex = expr.value.value[0];
      if (ex.type === 'AndExpression' || ex.type === 'OrExpression') {
        return processSQLExpression(ex);
      }
      const rule = processSQLExpression(ex) as DefaultRuleType;
      return rule ? { rules: [rule], ...(ic ? {} : { combinator: 'and' }) } : null;
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
            // flip the operator if the identifier was on the right,
            // since it's now on the left (as `field`)
            operator: normalizeOperator(expr.operator, isSQLIdentifier(expr.right)),
            value: evalSQLLiteralValue(valueObj),
          };
        }
      } else if (isSQLIdentifier(expr.left) && isSQLIdentifier(expr.right)) {
        return {
          field: getFieldName(expr.left.value),
          operator: normalizeOperator(expr.operator),
          value: getFieldName(expr.right.value),
          valueSource: 'field',
        };
      }
    } else if (expr.type === 'InExpressionListPredicate') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.left)) {
        const valueArray = expr.right.value.filter(isSQLLiteralValue).map(evalSQLLiteralValue);
        const fieldArray = expr.right.value.filter(isSQLIdentifier).map(getFieldName);
        if (valueArray.length > 0) {
          const value = options?.listsAsArrays ? valueArray : valueArray.join(', ');
          const operator = expr.hasNot ? 'notIn' : 'in';
          return { field: getFieldName(expr.left.value), operator, value };
        } else if (fieldArray.length > 0) {
          const value = options?.listsAsArrays ? fieldArray : fieldArray.join(', ');
          const operator = expr.hasNot ? 'notIn' : 'in';
          return { field: getFieldName(expr.left.value), operator, value, valueSource: 'field' };
        }
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
      } else if (
        isSQLIdentifier(expr.left) &&
        isSQLIdentifier(expr.right.left) &&
        isSQLIdentifier(expr.right.right)
      ) {
        const valueArray = [expr.right.left, expr.right.right].map(getFieldName);
        const value = options?.listsAsArrays ? valueArray : valueArray.join(', ');
        const operator = expr.hasNot ? 'notBetween' : 'between';
        return { field: getFieldName(expr.left.value), operator, value, valueSource: 'field' };
      }
    } else if (expr.type === 'LikePredicate') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.left) && expr.right.type === 'String') {
        const valueWithWildcards = evalSQLLiteralValue(expr.right) as string;
        const valueWithoutWildcards = valueWithWildcards.replace(/(^%)|(%$)/g, '');
        let operator: DefaultOperatorName = '=';
        /* istanbul ignore else */
        if (/^%.*%$/.test(valueWithWildcards) || valueWithWildcards === '%') {
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
      return { rules: [result], ...(ic ? {} : { combinator: 'and' }) };
    }
  }
  return { rules: [], ...(ic ? {} : { combinator: 'and' }) };
}

export { parseSQL };
