import type {
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ParseSQLOptions,
} from '@react-querybuilder/ts/src/index.noReact';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { sqlParser } from './sqlParser';
import type { MixedAndXorOrList, SQLExpression, SQLIdentifier } from './types';
import {
  evalSQLLiteralValue,
  generateFlatAndOrList,
  generateMixedAndXorOrList,
  getFieldName,
  getParamString,
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
  options: Omit<ParseSQLOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
function parseSQL(
  sql: string,
  options: Omit<ParseSQLOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseSQL(sql: string, options: ParseSQLOptions = {}): DefaultRuleGroupTypeAny {
  const { params, paramPrefix, independentCombinators, fields, getValueSources } = options;
  let sqlString = /^[ \t\n\r\s]*SELECT\b/i.test(sql)
    ? sql
    : /^[ \t\n\r\s]*WHERE\b/i.test(sql)
    ? `SELECT * FROM t ${sql}`
    : `SELECT * FROM t WHERE ${sql}`;
  let ic = false;
  const fieldsFlat = getFieldsArray(fields);

  ic = !!independentCombinators;
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

  const fieldIsValid = (
    fieldName: string,
    operator: DefaultOperatorName,
    subordinateFieldName?: string
  ) =>
    fieldIsValidUtil({
      fieldName,
      fieldsFlat,
      operator,
      subordinateFieldName,
      getValueSources,
    });

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
        return {
          rules: [rule],
          not: true,
          ...(!ic && { combinator: 'and' }),
        };
      }
    } else if (expr.type === 'SimpleExprParentheses') {
      const ex = expr.value.value[0];
      if (
        ex.type === 'AndExpression' ||
        ex.type === 'OrExpression' ||
        ex.type === 'XorExpression'
      ) {
        return processSQLExpression(ex);
      }
      const rule = processSQLExpression(ex) as DefaultRuleType;
      return rule ? { rules: [rule], ...(ic ? {} : { combinator: 'and' }) } : null;
    } else if (
      expr.type === 'AndExpression' ||
      expr.type === 'OrExpression' ||
      expr.type === 'XorExpression'
    ) {
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
      const andXorOrList = generateMixedAndXorOrList(expr);
      const { combinator } = andXorOrList;
      const rules = andXorOrList.expressions
        .map((obj): DefaultRuleGroupType | DefaultRuleType | null => {
          if ('combinator' in obj) {
            return {
              combinator: obj.combinator,
              rules: (obj.expressions as (SQLExpression | MixedAndXorOrList)[])
                .map(o => {
                  if ('combinator' in o) {
                    return {
                      combinator: o.combinator,
                      rules: (o.expressions as SQLExpression[])
                        .map(oa => processSQLExpression(oa))
                        .filter(Boolean),
                    };
                  } else {
                    return processSQLExpression(o);
                  }
                })
                .filter(Boolean) as DefaultRuleGroupArray,
            };
          }
          return processSQLExpression(obj) as DefaultRuleType | DefaultRuleGroupType | null;
        })
        .filter(Boolean) as DefaultRuleGroupArray;
      /* istanbul ignore else */
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (expr.type === 'IsNullBooleanPrimary') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.value)) {
        const f = getFieldName(expr.value);
        const operator = expr.hasNot ? 'notNull' : 'null';
        if (fieldIsValid(f, operator)) {
          return {
            field: f,
            operator,
            value: null,
          };
        }
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
          const f = getFieldName(identifier);
          // flip the operator if the identifier was on the right,
          // since it's now on the left as `field`
          const operator = normalizeOperator(expr.operator, isSQLIdentifier(expr.right));
          if (fieldIsValid(f, operator)) {
            return {
              field: f,
              operator,
              value: evalSQLLiteralValue(valueObj),
            };
          }
        }
      } else if (isSQLIdentifier(expr.left) && isSQLIdentifier(expr.right)) {
        const f = getFieldName(expr.left);
        const sf = getFieldName(expr.right);
        const operator = normalizeOperator(expr.operator);
        if (fieldIsValid(f, operator, sf)) {
          return {
            field: f,
            operator,
            value: sf,
            valueSource: 'field',
          };
        }
      }
    } else if (expr.type === 'InExpressionListPredicate') {
      /* istanbul ignore else */
      if (isSQLIdentifier(expr.left)) {
        const f = getFieldName(expr.left);
        const valueArray = expr.right.value.filter(isSQLLiteralValue).map(evalSQLLiteralValue);
        const operator = expr.hasNot ? 'notIn' : 'in';
        const fieldArray = expr.right.value
          .filter(isSQLIdentifier)
          .filter(sf => fieldIsValid(f, operator, sf.value))
          .map(getFieldName);
        if (valueArray.length > 0) {
          const value = options?.listsAsArrays ? valueArray : valueArray.join(', ');
          return { field: getFieldName(expr.left), operator, value };
        } else if (fieldArray.length > 0) {
          const value = options?.listsAsArrays ? fieldArray : fieldArray.join(', ');
          return {
            field: getFieldName(expr.left),
            operator,
            value,
            valueSource: 'field',
          };
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
        return { field: getFieldName(expr.left), operator, value };
      } else if (
        isSQLIdentifier(expr.left) &&
        isSQLIdentifier(expr.right.left) &&
        isSQLIdentifier(expr.right.right)
      ) {
        const f = getFieldName(expr.left);
        const valueArray = [expr.right.left, expr.right.right].map(getFieldName);
        const operator = expr.hasNot ? 'notBetween' : 'between';
        if (valueArray.every(sf => fieldIsValid(f, operator, sf))) {
          const value = options?.listsAsArrays ? valueArray : valueArray.join(', ');
          return { field: f, operator, value, valueSource: 'field' };
        }
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
        const f = getFieldName(expr.left);
        /* istanbul ignore else */
        if (fieldIsValid(f, operator)) {
          return { field: f, operator, value: valueWithoutWildcards };
        }
      } else if (
        isSQLIdentifier(expr.left) &&
        (expr.right.type === 'StartsWithExpr' ||
          expr.right.type === 'EndsWithExpr' ||
          expr.right.type === 'ContainsExpr')
      ) {
        let subordinateFieldName = '';
        let operator: DefaultOperatorName = '=';

        if (isSQLIdentifier(expr.right.value)) {
          subordinateFieldName = getFieldName(expr.right.value);
        }

        if (expr.right.type === 'EndsWithExpr') {
          operator = expr.hasNot ? 'doesNotEndWith' : 'endsWith';
        } else if (expr.right.type === 'StartsWithExpr') {
          operator = expr.hasNot ? 'doesNotBeginWith' : 'beginsWith';
        } else if (expr.right.type === 'ContainsExpr') {
          operator = expr.hasNot ? 'doesNotContain' : 'contains';
        }

        const baseFieldName = getFieldName(expr.left);

        if (operator !== '=' && fieldIsValid(baseFieldName, operator, subordinateFieldName)) {
          return {
            field: baseFieldName,
            operator,
            value: subordinateFieldName,
            valueSource: 'field',
          };
        }
      } else if (isSQLIdentifier(expr.left) && isSQLIdentifier(expr.right)) {
        const baseFieldName = getFieldName(expr.left);
        const subordinateFieldName = getFieldName(expr.right);
        const operator: DefaultOperatorName = '=';
        if (fieldIsValid(baseFieldName, operator, subordinateFieldName)) {
          return {
            field: baseFieldName,
            operator,
            value: subordinateFieldName,
            valueSource: 'field',
          };
        }
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
