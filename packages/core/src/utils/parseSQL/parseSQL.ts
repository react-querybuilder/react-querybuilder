import type { Except } from 'type-fest';
import type {
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ExpressionNode,
} from '../../types';
import type { ParserCommonOptions } from '../../types/import';
import { joinWith } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import { SQLParser } from './sqlParser';
import type {
  MixedAndXorOrList,
  ParsedSQL,
  ParseSQLExpressionContext,
  SQLExpression,
  SQLExpressionOperand,
  SQLIdentifier,
} from './types';
import {
  evalSQLLiteralValue,
  generateFlatAndOrList,
  generateMixedAndXorOrList,
  getFieldName,
  getParamString,
  isSQLExpressionOperand,
  isSQLIdentifier,
  isSQLLiteralOrSignedNumberValue,
  isSQLPlaceHolder,
  normalizeOperator,
} from './utils';

/**
 * Rewrites named (`:name`, or any configured prefix) and positional (`?`) parameter
 * placeholders into the grammar's native `${name}` form so they surface as `PlaceHolder`
 * nodes. Positional placeholders are named by 1-based ordinal. Skips string/quoted-identifier
 * literals so placeholder-like text inside them is preserved.
 */
// v8 ignore next -- @preserve
const normalizeParameterPlaceholders = (
  str: string,
  prefixes: string[],
  positional: boolean
): string => {
  let out = '';
  let quote = '';
  let ordinal = 0;
  for (let i = 0; i < str.length;) {
    const c = str[i];
    if (quote) {
      out += c;
      if (c === quote) {
        if (str[i + 1] === quote) {
          out += str[i + 1];
          i += 2;
          continue;
        }
        quote = '';
      }
      i++;
      continue;
    }
    if (c === `'` || c === `"` || c === '`') {
      quote = c;
      out += c;
      i++;
      continue;
    }
    if (positional && c === '?') {
      ordinal++;
      out += `\${${ordinal}}`;
      i++;
      continue;
    }
    let matched = false;
    for (const p of prefixes) {
      if (p.length > 0 && str.startsWith(p, i)) {
        const m = /^([A-Za-z_$][\w$]*)/.exec(str.slice(i + p.length));
        if (m) {
          out += `\${${m[1]}}`;
          i += p.length + m[1].length;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;
    out += c;
    i++;
  }
  return out;
};

/**
 * Options object for {@link parseSQL}.
 */
export interface ParseSQLOptions extends ParserCommonOptions {
  paramPrefix?: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  params?: any[] | Record<string, any>;
  /**
   * Handler that converts a non-identifier/non-literal SQL operand subtree (arithmetic
   * {@link SQLExpressionOperand BitExpression} / FunctionCall / parenthesized) into an
   * {@link ExpressionNode}. Return `null` to reject (the rule is dropped). Supplied by
   * `@react-querybuilder/expr` (`expressionParserSQL`). When omitted, expression operands
   * are ignored (current behavior — rule dropped).
   */
  getExpression?: (
    node: SQLExpressionOperand,
    ctx: ParseSQLExpressionContext
  ) => ExpressionNode | null;
  /**
   * When set, parameter placeholders are retained as `valueSource: 'parameter'` rules
   * (value = placeholder name) instead of being dropped. Placeholders whose name is
   * supplied via {@link ParseSQLOptions.params} are still substituted to literals first.
   *
   * - `true` — accept the default named prefix `':'` and positional `'?'`.
   * - `{ prefix }` — one or more named prefixes to accept (e.g. `':'`, `'@'`, `'$'`).
   * - `{ positional }` — enable/disable positional `?` (default enabled).
   */
  parseParameters?: boolean | { prefix?: string | string[]; positional?: boolean };
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
  const {
    params,
    paramPrefix,
    independentCombinators,
    fields,
    getValueSources,
    bigIntOnOverflow,
    getExpression,
    parseParameters,
  } = options;

  let sqlString = /^\s*select\b/i.test(sql)
    ? sql
    : /^\s*where\b/i.test(sql)
      ? `SELECT * FROM t ${sql}`
      : `SELECT * FROM t WHERE ${sql}`;
  let ic = false;
  const fieldsFlat = getFieldsArray(fields);

  ic = !!independentCombinators;
  /* v8 ignore else -- @preserve */
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

  if (parseParameters) {
    const cfg = parseParameters === true ? {} : parseParameters;
    const pre = cfg.prefix ?? ':';
    const prefixes = Array.isArray(pre) ? pre : [pre];
    const positional = cfg.positional ?? true;
    sqlString = normalizeParameterPlaceholders(sqlString, prefixes, positional);
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

  const exprCtx: ParseSQLExpressionContext = {
    bigIntOnOverflow,
    fieldExists: fieldName => fieldsFlat.length === 0 || fieldsFlat.some(f => f.name === fieldName),
  };

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
        // v8 ignore else
        if (rules.length > 0) {
          return { combinator, rules };
        }
        // v8 ignore next
        break;
      }
      case 'IsNullBooleanPrimary': {
        /* v8 ignore else -- @preserve */
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
          } else if (parseParameters && isSQLPlaceHolder(valueObj)) {
            const f = getFieldName(identifier);
            const operator = normalizeOperator(expr.operator, isSQLIdentifier(expr.right));
            if (fieldIsValid(f, operator)) {
              return { field: f, operator, value: valueObj.param, valueSource: 'parameter' };
            }
          } else if (getExpression && isSQLExpressionOperand(valueObj)) {
            const node = getExpression(valueObj as SQLExpressionOperand, exprCtx);
            if (!node) return null;
            const f = getFieldName(identifier);
            const operator = normalizeOperator(expr.operator, isSQLIdentifier(expr.right));
            if (fieldIsValid(f, operator)) {
              return { field: f, operator, value: node, valueSource: 'expression' };
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
        } else if (
          getExpression &&
          isSQLExpressionOperand(expr.left) &&
          isSQLExpressionOperand(expr.right)
        ) {
          // expression <op> expression → both sides on lhs/value
          const lhs = getExpression(expr.left as SQLExpressionOperand, exprCtx);
          const rhs = getExpression(expr.right as SQLExpressionOperand, exprCtx);
          if (!lhs || !rhs) return null;
          return {
            field: '',
            operator: normalizeOperator(expr.operator),
            lhs,
            value: rhs,
            valueSource: 'expression',
          };
        } else if (
          getExpression &&
          (isSQLExpressionOperand(expr.left) || isSQLExpressionOperand(expr.right))
        ) {
          // expression <op> literal (or literal <op> expression) → lhs = expression
          const exprOnLeft = isSQLExpressionOperand(expr.left);
          const exprSide = exprOnLeft ? expr.left : expr.right;
          const otherSide = exprOnLeft ? expr.right : expr.left;
          const lhs = getExpression(exprSide as SQLExpressionOperand, exprCtx);
          if (!lhs) return null;
          if (isSQLLiteralOrSignedNumberValue(otherSide)) {
            const operator = normalizeOperator(expr.operator, !exprOnLeft);
            return {
              field: '',
              operator,
              lhs,
              value: evalSQLLiteralValue(otherSide, { bigIntOnOverflow }),
            };
          }
          return null;
        }
        break;
      }
      case 'InExpressionListPredicate': {
        /* v8 ignore else -- @preserve */
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
        /* v8 ignore else -- @preserve */
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
        } else if (
          parseParameters &&
          isSQLIdentifier(expr.left) &&
          isSQLPlaceHolder(expr.right.left) &&
          isSQLPlaceHolder(expr.right.right)
        ) {
          const f = getFieldName(expr.left);
          const operator = expr.hasNot ? 'notBetween' : 'between';
          if (fieldIsValid(f, operator)) {
            const valueArray = [expr.right.left.param, expr.right.right.param];
            const value = options?.listsAsArrays ? valueArray : joinWith(valueArray, ', ');
            return { field: f, operator, value, valueSource: 'parameter' };
          }
        } else if (
          getExpression &&
          isSQLIdentifier(expr.left) &&
          (isSQLExpressionOperand(expr.right.left) || isSQLExpressionOperand(expr.right.right))
        ) {
          const rhs = getExpression(expr.right.left as SQLExpressionOperand, exprCtx);
          const rhs2 = getExpression(expr.right.right as SQLExpressionOperand, exprCtx);
          if (!rhs || !rhs2) return null;
          const f = getFieldName(expr.left);
          const operator = expr.hasNot ? 'notBetween' : 'between';
          if (fieldIsValid(f, operator)) {
            return { field: f, operator, value: [rhs, rhs2], valueSource: 'expression' };
          }
        }

        break;
      }
      case 'LikePredicate': {
        /* v8 ignore else -- @preserve */
        if (isSQLIdentifier(expr.left) && expr.right.type === 'String') {
          const valueWithWildcards = evalSQLLiteralValue(expr.right) as string;
          const valueWithoutWildcards = valueWithWildcards.replaceAll(/(^%)|(%$)/g, '');
          let operator: DefaultOperatorName = '=';
          /* v8 ignore else -- @preserve */
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
          /* v8 ignore else -- @preserve */
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

  const sqlParser = new SQLParser();
  const { where } = (sqlParser.parse(sqlString) as ParsedSQL).value;
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
