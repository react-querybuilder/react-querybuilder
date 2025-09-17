import type { ParserCommonOptions } from '../../types/import';
import type {
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  Except,
} from '../../types';
import { joinWith } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import { sqlParser } from './sqlParser';
import type { MixedAndXorOrList, SQLExpression, SQLIdentifier } from './types';
import {
  evalSQLLiteralValue,
  generateFlatAndOrList,
  generateMixedAndXorOrList,
  getFieldName,
  getParamString,
  isSQLIdentifier,
  isSQLLiteralOrSignedNumberValue,
  normalizeOperator,
} from './utils';

/**
 * Options object for {@link parseSQL}.
 */
export interface ParseSQLOptions extends ParserCommonOptions {
  paramPrefix?: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  params?: any[] | Record<string, any>;
}
/**
 * Converts a SQL `SELECT` statement into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseSQL(sql: string): DefaultRuleGroupType;
/**
 * Converts a SQL `SELECT` statement into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseSQL(
  sql: string,
  options: Except<ParseSQLOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a SQL `SELECT` statement into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseSQL(
  sql: string,
  options: Except<ParseSQLOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseSQL(sql: string, options: ParseSQLOptions = {}): DefaultRuleGroupTypeAny {
  const { params, paramPrefix, independentCombinators, fields, getValueSources, bigIntOnOverflow } =
    options;

  let sqlString = /^\s*select\b/i.test(sql)
    ? sql
    : /^\s*where\b/i.test(sql)
      ? `SELECT * FROM t ${sql}`
      : `SELECT * FROM t WHERE ${sql}`;
  let ic = false;
  const fieldsFlat = getFieldsArray(fields);

  ic = !!independentCombinators;
  /* istanbul ignore else */
  if (params) {
    if (Array.isArray(params)) {
      let i = 0;
      sqlString = sqlString.replaceAll('?', () => {
        const paramString = getParamString(params[i]);
        i++;
        return paramString;
      });
    } else {
      const keys = Object.keys(params);
      const prefix = paramPrefix ?? ':';
      for (const p of keys) {
        sqlString = sqlString.replaceAll(
          new RegExp(`\\${prefix}${p}\\b`, 'ig'),
          getParamString(params[p])
        );
      }
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
    switch (expr.type) {
      case 'NotExpression': {
        const val =
          expr.value.type === 'SimpleExprParentheses' ? expr.value.value.value[0] : expr.value;
        const rule = processSQLExpression(val);
        /* instanbul ignore else */
        if (rule) {
          if (isRuleGroup(rule)) {
            return { ...rule, not: true };
          }
          return {
            rules: [rule],
            not: true,
            ...(!ic && { combinator: 'and' }),
          };
        }
        break;
      }
      case 'SimpleExprParentheses': {
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
      }
      case 'AndExpression':
      case 'OrExpression':
      case 'XorExpression': {
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
                    return 'combinator' in o
                      ? {
                          combinator: o.combinator,
                          rules: (o.expressions as SQLExpression[])
                            .map(oa => processSQLExpression(oa))
                            .filter(Boolean),
                        }
                      : processSQLExpression(o);
                  })
                  .filter(Boolean) as DefaultRuleGroupArray,
              };
            }
            return processSQLExpression(obj) as DefaultRuleType | DefaultRuleGroupType | null;
          })
          .filter(Boolean) as DefaultRuleGroupArray;
        // istanbul ignore else
        if (rules.length > 0) {
          return { combinator, rules };
        }
        // istanbul ignore next
        break;
      }
      case 'IsNullBooleanPrimary': {
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
        break;
      }
      case 'ComparisonBooleanPrimary': {
        /* istanbul ignore else */
        if (
          (isSQLIdentifier(expr.left) && !isSQLIdentifier(expr.right)) ||
          (!isSQLIdentifier(expr.left) && isSQLIdentifier(expr.right))
        ) {
          const identifier = isSQLIdentifier(expr.left)
            ? expr.left.value
            : (expr.right as SQLIdentifier).value;
          const valueObj = [expr.left, expr.right].find(t => !isSQLIdentifier(t));
          if (isSQLLiteralOrSignedNumberValue(valueObj)) {
            const f = getFieldName(identifier);
            // flip the operator if the identifier was on the right,
            // since it's now on the left as `field`
            const operator = normalizeOperator(expr.operator, isSQLIdentifier(expr.right));
            if (fieldIsValid(f, operator)) {
              return {
                field: f,
                operator,
                value: evalSQLLiteralValue(valueObj, { bigIntOnOverflow }),
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
        break;
      }
      case 'InExpressionListPredicate': {
        /* istanbul ignore else */
        if (isSQLIdentifier(expr.left)) {
          const f = getFieldName(expr.left);
          const valueArray = expr.right.value
            .filter(v => isSQLLiteralOrSignedNumberValue(v))
            .map(v => evalSQLLiteralValue(v, { bigIntOnOverflow }));
          const operator = expr.hasNot ? 'notIn' : 'in';
          const fieldArray = expr.right.value
            .filter(v => isSQLIdentifier(v))
            .filter(sf => fieldIsValid(f, operator, sf.value))
            .map(v => getFieldName(v));
          if (valueArray.length > 0) {
            const value = options?.listsAsArrays ? valueArray : joinWith(valueArray, ', ');
            return { field: getFieldName(expr.left), operator, value };
          } else if (fieldArray.length > 0) {
            const value = options?.listsAsArrays ? fieldArray : joinWith(fieldArray, ', ');
            return {
              field: getFieldName(expr.left),
              operator,
              value,
              valueSource: 'field',
            };
          }
        }

        break;
      }
      case 'BetweenPredicate': {
        /* istanbul ignore else */
        if (
          isSQLIdentifier(expr.left) &&
          isSQLLiteralOrSignedNumberValue(expr.right.left) &&
          isSQLLiteralOrSignedNumberValue(expr.right.right)
        ) {
          const valueArray = [expr.right.left, expr.right.right].map(v =>
            evalSQLLiteralValue(v, { bigIntOnOverflow })
          );
          const value = options?.listsAsArrays ? valueArray : joinWith(valueArray, ', ');
          const operator = expr.hasNot ? 'notBetween' : 'between';
          return { field: getFieldName(expr.left), operator, value };
        } else if (
          isSQLIdentifier(expr.left) &&
          isSQLIdentifier(expr.right.left) &&
          isSQLIdentifier(expr.right.right)
        ) {
          const f = getFieldName(expr.left);
          const valueArray = [expr.right.left, expr.right.right].map(v => getFieldName(v));
          const operator = expr.hasNot ? 'notBetween' : 'between';
          if (valueArray.every(sf => fieldIsValid(f, operator, sf))) {
            const value = options?.listsAsArrays ? valueArray : joinWith(valueArray, ', ');
            return { field: f, operator, value, valueSource: 'field' };
          }
        }

        break;
      }
      case 'LikePredicate': {
        /* istanbul ignore else */
        if (isSQLIdentifier(expr.left) && expr.right.type === 'String') {
          const valueWithWildcards = evalSQLLiteralValue(expr.right) as string;
          const valueWithoutWildcards = valueWithWildcards.replaceAll(/(^%)|(%$)/g, '');
          let operator: DefaultOperatorName = '=';
          /* istanbul ignore else */
          if (
            (valueWithWildcards.endsWith('%') && valueWithWildcards.startsWith('%')) ||
            valueWithWildcards === '%'
          ) {
            operator = expr.hasNot ? 'doesNotContain' : 'contains';
          } else if (valueWithWildcards.endsWith('%')) {
            operator = expr.hasNot ? 'doesNotBeginWith' : 'beginsWith';
          } else if (valueWithWildcards.startsWith('%')) {
            operator = expr.hasNot ? 'doesNotEndWith' : 'endsWith';
          } else if (expr.hasNot && operator === '=') {
            operator = '!=';
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

          switch (expr.right.type) {
            case 'EndsWithExpr': {
              operator = expr.hasNot ? 'doesNotEndWith' : 'endsWith';
              break;
            }
            case 'StartsWithExpr': {
              operator = expr.hasNot ? 'doesNotBeginWith' : 'beginsWith';
              break;
            }
            case 'ContainsExpr': {
              operator = expr.hasNot ? 'doesNotContain' : 'contains';
              break;
            }
            default:
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

        break;
      }
      // No default
    }
    return null;
  };

  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  const { where } = sqlParser.parse(sqlString).value;
  if (where) {
    const result = processSQLExpression(where);
    if (result) {
      if (isRuleGroup(result)) {
        return prepare(result);
      }
      return prepare({ rules: [result], ...(ic ? {} : { combinator: 'and' }) });
    }
  }
  return prepare({ rules: [], ...(ic ? {} : { combinator: 'and' }) });
}

export { parseSQL };
