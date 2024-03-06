import { SpelExpressionEvaluator } from 'spel2js';
import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ParseSpELOptions,
  ValueSource,
} from '../../types/index.noReact';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import type { SpELExpressionNode, SpELProcessedExpression } from './types';
import {
  generateFlatAndOrList,
  generateMixedAndOrList,
  isSpELBetweenFields,
  isSpELBetweenValues,
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
 * Converts a SpEL string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupType}).
 */
function parseSpEL(spel: string): DefaultRuleGroupType;
/**
 * Converts a SpEL string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupType}).
 */
function parseSpEL(
  spel: string,
  options: Omit<ParseSpELOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a SpEL string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupTypeIC}).
 */
function parseSpEL(
  spel: string,
  options: Omit<ParseSpELOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseSpEL(spel: string, options: ParseSpELOptions = {}): DefaultRuleGroupTypeAny {
  const { fields, independentCombinators, listsAsArrays } = options;
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
      // istanbul ignore else
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
      // istanbul ignore else
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
          // istanbul ignore else
          if (isSpELPrimitive(right)) {
            regex = right.value;
          }
        }
      } else {
        // istanbul ignore else
        if (isSpELIdentifier(right) && isSpELPrimitive(left)) {
          field = right.identifier;
          regex = left.value;
        }
      }

      if (/^[^^].*[^$]$/.test(regex)) {
        // istanbul ignore else
        if (fieldIsValid(field, 'contains')) {
          return {
            field,
            operator: 'contains',
            value: regex,
            ...(valueSource ? { valueSource } : {}),
          };
        }
      } else {
        if (/^\^.*[^$]/.test(regex)) {
          // istanbul ignore else
          if (fieldIsValid(field, 'beginsWith')) {
            return {
              field,
              operator: 'beginsWith',
              value: regex.replace(/^\^/, ''),
            };
          }
        } else {
          // istanbul ignore else
          if (/[^^].*\$/.test(regex)) {
            // istanbul ignore else
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // istanbul ignore else
      if (
        field &&
        values.every(v => fieldIsValid(field, 'between', valueSource === 'field' ? v : undefined))
      ) {
        const valueArray =
          values[0] < values[1] || valueSource === 'field' ? values : [values[1], values[0]];
        const value = listsAsArrays ? valueArray : valueArray.join(',');
        return valueSource
          ? { field, operator: 'between', value, valueSource }
          : { field, operator: 'between', value };
      }
    } else if (isSpELRelationOp(expr)) {
      let field: string | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = undefined;
      let valueSource: ValueSource | undefined = undefined;
      let flip = false;
      const [left, right] = expr.children;

      if (isSpELIdentifier(left)) {
        field = left.identifier;
        if (isSpELIdentifier(right)) {
          value = right.identifier;
          valueSource = 'field';
        } else if (isSpELPrimitive(right)) {
          value = right.value;
        }
      } else {
        // istanbul ignore else
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
        typeof value !== 'undefined'
      ) {
        return valueSource ? { field, operator, value, valueSource } : { field, operator, value };
      }
    }
    return null;
  };

  let compiledSpEL: SpELExpressionNode;
  try {
    compiledSpEL = SpelExpressionEvaluator.compile(spel)._compiledExpression;
  } catch (err) {
    return emptyQuery;
  }

  const processedSpEL = processCompiledExpression(compiledSpEL);

  const result = parseProcessedSpEL(processedSpEL);
  if (result) {
    if (isRuleGroup(result)) {
      return result;
    }
    return { rules: [result], ...(ic ? {} : { combinator: 'and' }) };
  }

  return emptyQuery;
}

export { parseSpEL };
