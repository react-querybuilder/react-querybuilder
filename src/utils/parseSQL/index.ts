import { isRuleGroup } from '..';
import { RuleType } from '../..';
import { ParseSQLOptions, RuleGroupType } from '../../types';
import sqlParser from './sqlParser';
import {
  isSQLIdentifier,
  isSQLLiteralValue,
  SQLExpression,
  SQLIdentifier,
  SQLLiteralValue
} from './types';

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

const evalSQLLiteralValue = (valueObj: SQLLiteralValue) =>
  valueObj.type === 'String'
    ? valueObj.value.replace(/(^'|'$)/g, '').replace(/(^"|"$)/g, '')
    : valueObj.type === 'Boolean'
    ? valueObj.value.toLowerCase() === 'true'
    : parseFloat(valueObj.value);

const processSQLExpression = (expr: SQLExpression): RuleType | RuleGroupType | null => {
  if (expr.type === 'SimpleExprParentheses') {
    const rule = processSQLExpression(expr.value.value[0]);
    if (rule) {
      return { combinator: 'and', rules: [rule] };
    }
  } else if (expr.type === 'AndExpression' || expr.type === 'OrExpression') {
    const rules = [expr.left, expr.right]
      .map((e) => processSQLExpression(e))
      .filter((r) => !!r) as (RuleGroupType | RuleType)[];
    return { combinator: expr.operator.toLowerCase(), rules };
  } else if (expr.type === 'IsNullBooleanPrimary') {
    if (isSQLIdentifier(expr.value)) {
      return {
        field: getFieldName(expr.value.value),
        operator: expr.hasNot ? 'notNull' : 'null',
        value: null
      };
    }
  } else if (expr.type === 'ComparisonBooleanPrimary') {
    if (
      (isSQLIdentifier(expr.left) && !isSQLIdentifier(expr.right)) ||
      (!isSQLIdentifier(expr.left) && isSQLIdentifier(expr.right))
    ) {
      const identifier = isSQLIdentifier(expr.left)
        ? expr.left.value
        : (expr.right as SQLIdentifier).value;
      const valueObj = [expr.left, expr.right].find((t) => !isSQLIdentifier(t));
      if (isSQLLiteralValue(valueObj)) {
        return {
          field: getFieldName(identifier),
          operator: expr.operator.replace('<>', '!='),
          value: evalSQLLiteralValue(valueObj)
        };
      }
    }
  } else if (expr.type === 'InExpressionListPredicate') {
    if (isSQLIdentifier(expr.left)) {
      const value = (expr.right.value.filter((ex) => isSQLLiteralValue(ex)) as SQLLiteralValue[])
        .map((ex) => evalSQLLiteralValue(ex))
        .join(', ');
      const operator = expr.hasNot ? 'notIn' : 'in';
      return { field: getFieldName(expr.left.value), operator, value };
    }
  } else if (expr.type === 'BetweenPredicate') {
    if (
      isSQLIdentifier(expr.left) &&
      isSQLLiteralValue(expr.right.left) &&
      isSQLLiteralValue(expr.right.right)
    ) {
      const value = `${evalSQLLiteralValue(expr.right.left)},${evalSQLLiteralValue(
        expr.right.right
      )}`;
      const operator = expr.hasNot ? 'notBetween' : 'between';
      return { field: getFieldName(expr.left.value), operator, value };
    }
  } else if (expr.type === 'LikePredicate') {
    if (isSQLIdentifier(expr.left) && expr.right.type === 'String') {
      const valueWithWildcards = evalSQLLiteralValue(expr.right) as string;
      const valueWithoutWildcards = valueWithWildcards.replace(/(^%)|(%$)/g, '');
      let operator = '=';
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

const parseSQL = (sql: string, options?: ParseSQLOptions): RuleGroupType => {
  let sqlString = /^[ \t\n\r]*SELECT\b/i.test(sql) ? sql : `SELECT * FROM mesa WHERE ${sql}`;
  if (options) {
    const { params, paramPrefix } = options;
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
        keys.forEach((p) => {
          sqlString = sqlString.replace(
            new RegExp(`\\${prefix}${p}\\b`, 'ig'),
            getParamString(params[p])
          );
        });
      }
    }
  }

  const { where } = sqlParser.parse(sqlString).value;
  if (where) {
    const result = processSQLExpression(where);
    if (result) {
      if (isRuleGroup(result)) {
        return result;
      }
      return { combinator: 'and', rules: [result] };
    }
  }
  return { combinator: 'and', rules: [] };
};

export default parseSQL;
