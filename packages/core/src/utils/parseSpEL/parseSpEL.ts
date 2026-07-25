import { SpelExpressionEvaluator } from 'spel2js';
import type { Except } from 'type-fest';
import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ExpressionNode,
  ValueSource,
} from '../../types';
import type { ParserCommonOptions } from '../../types/import';
import { joinWith } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import type {
  ParseSpELExpressionContext,
  SpELExpressionNode,
  SpELExpressionOperand,
  SpELProcessedExpression,
} from './types';
import {
  generateFlatAndOrList,
  generateMixedAndOrList,
  isSpELBetweenFields,
  isSpELBetweenValues,
  isSpELExpressionOperand,
  isSpELIdentifier,
  isSpELOpAnd,
  isSpELOpMatches,
  isSpELOpOr,
  isSpELPrimitive,
  isSpELRelationOp,
  normalizeOperator,
  processCompiledExpression,
} from './utils';

/**
 * Options object for {@link parseSpEL!parseSpEL}.
 */
export interface ParseSpELOptions extends ParserCommonOptions {
  /**
   * Handler that converts a SpEL expression operand subtree into an {@link ExpressionNode}.
   * Return `null` to reject (the rule is dropped). Supplied by `@react-querybuilder/expr`
   * (`expressionParserSpEL`). When omitted, expression operands are ignored (rule dropped).
   *
   * Arithmetic infix operands and method/function invocations
   * (`T(java.lang.Math).abs/min/max(...)`, `.toUpperCase()`/`.toLowerCase()`, and custom calls)
   * are both supported. See {@link SpELExpressionOperand}.
   */
  getExpression?: (
    node: SpELExpressionOperand,
    ctx: ParseSpELExpressionContext
  ) => ExpressionNode | null;
}

/**
 * Converts a SpEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseSpEL(spel: string): DefaultRuleGroupType;
/**
 * Converts a SpEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseSpEL(
  spel: string,
  options: Except<ParseSpELOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a SpEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}).
 */
function parseSpEL(
  spel: string,
  options: Except<ParseSpELOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseSpEL(spel: string, options: ParseSpELOptions = {}): DefaultRuleGroupTypeAny {
  const { fields, independentCombinators, listsAsArrays, getExpression } = options;
  const ic = !!independentCombinators;
  const fieldsFlat = getFieldsArray(fields);

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
      getValueSources: options?.getValueSources,
    });

  const exprCtx: ParseSpELExpressionContext = {
    fieldExists: fieldName => fieldsFlat.length === 0 || fieldsFlat.some(f => f.name === fieldName),
  };

  const emptyQuery: DefaultRuleGroupTypeAny = {
    rules: [],
    ...(ic ? {} : { combinator: 'and' }),
  };

  const parseProcessedSpEL = (
    expr: SpELProcessedExpression,
    processOpts: {
      groupOnlyIfNecessary?: boolean;
      forwardNegation?: boolean;
    } = {}
  ): DefaultRuleType | DefaultRuleGroupTypeAny | null => {
    const { forwardNegation: _forwardedNegation, groupOnlyIfNecessary: _g } = processOpts;
    if (expr.type === 'op-not') {
      const negatedExpr = parseProcessedSpEL(expr.children[0]);
      // v8 ignore else
      if (negatedExpr) {
        if (
          !isRuleGroup(negatedExpr) &&
          (negatedExpr.operator === 'contains' ||
            negatedExpr.operator === 'beginsWith' ||
            negatedExpr.operator === 'endsWith')
        ) {
          return {
            ...negatedExpr,
            operator: `doesNot${negatedExpr.operator[0].toUpperCase()}${negatedExpr.operator
              .slice(1)
              .replace('s', '')}` as DefaultOperatorName,
          };
        }
        return ic
          ? ({ rules: [negatedExpr], not: true } as DefaultRuleGroupTypeIC)
          : ({
              combinator: 'and',
              rules: [negatedExpr],
              not: true,
            } as DefaultRuleGroupType);
      }
    } else if (isSpELOpAnd(expr) || isSpELOpOr(expr)) {
      if (ic) {
        const andOrList = generateFlatAndOrList(expr);
        const rules = andOrList.map(v => {
          if (typeof v === 'string') {
            return v;
          }
          return parseProcessedSpEL(v);
        });
        // Bail out completely if any rules in the list were invalid
        // so as not to return an incorrect and/or sequence
        if (!rules.every(Boolean)) {
          return null;
        }
        return {
          rules: rules as DefaultRuleGroupICArray,
        };
      }
      const andOrList = generateMixedAndOrList(expr);
      const combinator = andOrList[1] as DefaultCombinatorName;
      const filteredList = andOrList
        .filter(v => Array.isArray(v) || (!!v && typeof v !== 'string' && 'type' in v))
        .map(v =>
          Array.isArray(v) ? v.filter(vf => !!v && typeof vf !== 'string' && 'type' in vf) : v
        ) as (SpELProcessedExpression | SpELProcessedExpression[])[];
      const rules = filteredList
        .map((exp): DefaultRuleGroupType | DefaultRuleType | null => {
          if (Array.isArray(exp)) {
            return {
              combinator: 'and',
              rules: exp.map(e => parseProcessedSpEL(e)).filter(Boolean) as DefaultRuleGroupArray,
            };
          }
          return parseProcessedSpEL(exp) as DefaultRuleType | DefaultRuleGroupType | null;
        })
        .filter(Boolean) as DefaultRuleGroupArray;
      // v8 ignore else
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (isSpELOpMatches(expr)) {
      const [left, right] = expr.children;
      let field: string = '';
      let regex: string = '';
      let valueSource: ValueSource | undefined = undefined;
      if (isSpELIdentifier(left)) {
        field = left.identifier;
        if (isSpELIdentifier(right)) {
          regex = right.identifier;
          valueSource = 'field';
        } else {
          // v8 ignore else
          if (isSpELPrimitive(right)) {
            regex = right.value;
          }
        }
      } else {
        // v8 ignore else
        if (isSpELIdentifier(right) && isSpELPrimitive(left)) {
          field = right.identifier;
          regex = left.value;
        }
      }

      if (/^(?!\^).*?(?<!\$)$/.test(regex)) {
        // v8 ignore else
        if (fieldIsValid(field, 'contains')) {
          return {
            field,
            operator: 'contains',
            value: regex,
            ...(valueSource ? { valueSource } : {}),
          };
        }
      } else {
        if (/^\^.*?(?<!\$)$/.test(regex)) {
          // v8 ignore else
          if (fieldIsValid(field, 'beginsWith')) {
            return {
              field,
              operator: 'beginsWith',
              value: regex.replace(/^\^/, ''),
            };
          }
        } else {
          // v8 ignore else
          if (/^(?!\^).*?\$$/.test(regex)) {
            // v8 ignore else
            if (fieldIsValid(field, 'endsWith')) {
              return {
                field,
                operator: 'endsWith',
                value: regex.replace(/\$$/, ''),
              };
            }
          }
        }
      }
    } else if (isSpELBetweenValues(expr) || isSpELBetweenFields(expr)) {
      // oxlint-disable-next-line typescript/no-explicit-any
      let values: [any, any] = [null, null];
      let valueSource: ValueSource | undefined = undefined;
      const [
        { identifier: field },
        {
          children: [left, right],
        },
      ] = expr.children;

      if (isSpELBetweenValues(expr)) {
        values = [left.value, right.value];
      } else {
        values = [left.identifier, right.identifier];
        valueSource = 'field';
      }
      // v8 ignore else
      if (
        field &&
        values.every(v => fieldIsValid(field, 'between', valueSource === 'field' ? v : undefined))
      ) {
        const valueArray =
          values[0] < values[1] || valueSource === 'field' ? values : [values[1], values[0]];
        const value = listsAsArrays ? valueArray : joinWith(valueArray, ',');
        return valueSource
          ? { field, operator: 'between', value, valueSource }
          : { field, operator: 'between', value };
      }
    } else if (isSpELRelationOp(expr)) {
      let field: string | null = null;
      // oxlint-disable-next-line typescript/no-explicit-any
      let value: any = undefined;
      let valueSource: ValueSource | undefined = undefined;
      let flip = false;
      const [left, right] = expr.children;

      // Arithmetic and method/function expression operands (from `@react-querybuilder/expr`)
      if (getExpression) {
        const leftIsExpr = isSpELExpressionOperand(left);
        const rightIsExpr = isSpELExpressionOperand(right);
        if (leftIsExpr || rightIsExpr) {
          const op = (flipOp: boolean) => normalizeOperator(expr.type, flipOp);
          if (leftIsExpr && rightIsExpr) {
            // expression <op> expression → both sides on lhs/value
            const l = getExpression(left, exprCtx);
            const r = getExpression(right, exprCtx);
            return l && r
              ? { field: '', operator: op(false), lhs: l, value: r, valueSource: 'expression' }
              : null;
          }
          if (isSpELIdentifier(left) && rightIsExpr) {
            // field <op> expression → rhs expression
            const node = getExpression(right, exprCtx);
            const f = left.identifier;
            const operator = op(false);
            return node && fieldIsValid(f, operator)
              ? { field: f, operator, value: node, valueSource: 'expression' }
              : null;
          }
          if (leftIsExpr && isSpELIdentifier(right)) {
            // expression <op> field → flip to field <op> expression
            const node = getExpression(left, exprCtx);
            const f = right.identifier;
            const operator = op(true);
            return node && fieldIsValid(f, operator)
              ? { field: f, operator, value: node, valueSource: 'expression' }
              : null;
          }
          if (leftIsExpr && isSpELPrimitive(right)) {
            // expression <op> literal → lhs = expression, literal value
            const l = getExpression(left, exprCtx);
            return l ? { field: '', operator: op(false), lhs: l, value: right.value } : null;
          }
          if (isSpELPrimitive(left)) {
            // literal <op> expression → lhs = expression, flip operator
            const r = getExpression(right, exprCtx);
            return r ? { field: '', operator: op(true), lhs: r, value: left.value } : null;
          }
        }
      }

      if (isSpELIdentifier(left)) {
        field = left.identifier;
        if (isSpELIdentifier(right)) {
          value = right.identifier;
          valueSource = 'field';
        } else if (isSpELPrimitive(right)) {
          value = right.value;
        }
      } else {
        // v8 ignore else
        if (isSpELIdentifier(right) && isSpELPrimitive(left)) {
          flip = true;
          field = right.identifier;
          value = left.value;
        }
      }
      let operator = normalizeOperator(expr.type, flip);
      if (value === null && (operator === '=' || operator === '!=')) {
        operator = operator === '=' ? 'null' : 'notNull';
      }
      if (
        field &&
        fieldIsValid(field, operator, valueSource === 'field' ? value : undefined) &&
        value !== undefined
      ) {
        return valueSource ? { field, operator, value, valueSource } : { field, operator, value };
      }
    }
    return null;
  };

  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  let compiledSpEL: SpELExpressionNode;
  try {
    compiledSpEL = SpelExpressionEvaluator.compile(spel)._compiledExpression;
  } catch {
    return prepare(emptyQuery);
  }

  const processedSpEL = processCompiledExpression(compiledSpEL);

  const result = parseProcessedSpEL(processedSpEL);
  if (result) {
    if (isRuleGroup(result)) {
      return prepare(result);
    }
    return prepare({ rules: [result], ...(ic ? {} : { combinator: 'and' }) });
  }

  return prepare(emptyQuery);
}

export { parseSpEL };
