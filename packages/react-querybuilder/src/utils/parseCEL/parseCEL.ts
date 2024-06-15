import { defaultOperatorNegationMap } from '../../defaults';
import type {
  DefaultCombinatorName,
  DefaultOperatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupICArray,
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  ParseCELOptions,
  ValueSource,
} from '../../types/index.noReact';
import { joinWith } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { celParser } from './celParser';
import type { CELExpression, CELIdentifier, CELLikeExpression, CELLiteral } from './types';
import {
  evalCELLiteralValue,
  generateFlatAndOrList,
  generateMixedAndOrList,
  getIdentifierFromChain,
  getIdentifierFromNegatedChain,
  isCELConditionalAnd,
  isCELConditionalOr,
  isCELExpressionGroup,
  isCELIdentifierOrChain,
  isCELLikeExpression,
  isCELList,
  isCELLiteral,
  isCELMap,
  isCELNegatedLikeExpression,
  isCELNegation,
  isCELRelation,
  isCELStringLiteral,
  normalizeOperator,
} from './utils';

/**
 * Converts a CEL string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupType}).
 */
function parseCEL(cel: string): DefaultRuleGroupType;
/**
 * Converts a CEL string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupType}).
 */
function parseCEL(
  cel: string,
  options: Omit<ParseCELOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
/**
 * Converts a CEL string expression into a query suitable for the
 * {@link QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link DefaultRuleGroupTypeIC}).
 */
function parseCEL(
  cel: string,
  options: Omit<ParseCELOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
function parseCEL(cel: string, options: ParseCELOptions = {}): DefaultRuleGroupTypeAny {
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

  const processCELExpression = (
    expr: CELExpression,
    processOpts: {
      groupOnlyIfNecessary?: boolean;
      forwardNegation?: boolean;
    } = {}
  ): DefaultRuleType | DefaultRuleGroupTypeAny | null => {
    const { forwardNegation: forwardedNegation, groupOnlyIfNecessary } = processOpts;
    /* istanbul ignore if */
    if (isCELNegation(expr) || isCELNegatedLikeExpression(expr)) {
      const negate = isCELNegation(expr)
        ? expr.negations % 2 === 1
        : (getIdentifierFromNegatedChain(expr.left).match(/^!+/)?.[0].length ?? 0) % 2 === 1;
      const negatedExpr =
        isCELNegation(expr) &&
        isCELExpressionGroup(expr.value) &&
        isCELLikeExpression(expr.value.value)
          ? processCELExpression(expr.value.value, { forwardNegation: negate })
          : isCELNegatedLikeExpression(expr)
            ? processCELExpression(
                {
                  ...expr,
                  left: {
                    type: 'Identifier',
                    value: getIdentifierFromNegatedChain(expr.left).replace(/^!+/, ''),
                  },
                } as CELLikeExpression,
                { forwardNegation: negate }
              )
            : isCELNegation(expr) &&
                isCELExpressionGroup(expr.value) &&
                isCELRelation(expr.value.value)
              ? processCELExpression(expr.value.value, { forwardNegation: negate })
              : processCELExpression(expr.value, {
                  groupOnlyIfNecessary: true,
                  forwardNegation: negate,
                });
      if (negatedExpr) {
        if (
          isCELNegatedLikeExpression(expr) ||
          (isCELNegation(expr) &&
            isCELExpressionGroup(expr.value) &&
            isCELRelation(expr.value.value))
        ) {
          return negatedExpr;
        } else if (
          !negate ||
          (negate && !isRuleGroup(negatedExpr) && negatedExpr.operator.startsWith('doesNot'))
        ) {
          return ic
            ? ({ rules: [negatedExpr] } as DefaultRuleGroupTypeIC)
            : ({
                combinator: 'and',
                rules: [negatedExpr],
              } as DefaultRuleGroupType);
        }
        return ic
          ? ({ rules: [negatedExpr], not: true } as DefaultRuleGroupTypeIC)
          : ({
              combinator: 'and',
              rules: [negatedExpr],
              not: true,
            } as DefaultRuleGroupType);
      }
    } else if (isCELExpressionGroup(expr)) {
      const rule = processCELExpression(expr.value, {
        groupOnlyIfNecessary: true,
      });
      if (rule) {
        if (isRuleGroup(rule) || (groupOnlyIfNecessary && isCELExpressionGroup(expr.value))) {
          return rule;
        }
        return ic ? { rules: [rule] } : { combinator: 'and', rules: [rule] };
      }
    } else if (isCELConditionalAnd(expr) || isCELConditionalOr(expr)) {
      if (ic) {
        const andOrList = generateFlatAndOrList(expr);
        const rules = andOrList.map(v => {
          if (typeof v === 'string') {
            return v;
          }
          return processCELExpression(v);
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
        ) as (CELExpression | CELExpression[])[];
      const rules = filteredList
        .map((exp): DefaultRuleGroupType | DefaultRuleType | null => {
          if (Array.isArray(exp)) {
            return {
              combinator: 'and',
              rules: exp.map(e => processCELExpression(e)).filter(Boolean) as DefaultRuleGroupArray,
            };
          }
          return processCELExpression(exp) as DefaultRuleType | DefaultRuleGroupType | null;
        })
        .filter(Boolean) as DefaultRuleGroupArray;
      /* istanbul ignore else */
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (isCELLikeExpression(expr)) {
      const field = getIdentifierFromChain(expr.left);
      const func = expr.right.value;
      const operatorPre: DefaultOperatorName = func === 'startsWith' ? 'beginsWith' : func;
      const operator = forwardedNegation
        ? (`doesNot${operatorPre[0].toUpperCase()}${operatorPre
            .slice(1)
            .replace('s', '')}` as DefaultOperatorName)
        : operatorPre;
      const valueObj = expr.list.value[0];
      const value = isCELStringLiteral(valueObj) ? evalCELLiteralValue(valueObj) : valueObj.value;
      const valueSource: ValueSource | undefined =
        expr.list.value[0].type === 'Identifier' ? 'field' : undefined;
      if (fieldIsValid(field, operator, valueSource === 'field' ? value : undefined)) {
        return valueSource ? { field, operator, value, valueSource } : { field, operator, value };
      }
    } else if (isCELRelation(expr)) {
      let field: string | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = undefined;
      let valueSource: ValueSource | undefined = undefined;
      let flip = false;
      const { left, right } = expr;
      if (isCELIdentifierOrChain(left)) {
        field = getIdentifierFromChain(left);
        if (isCELIdentifierOrChain(right)) {
          value = getIdentifierFromChain(right);
          valueSource = 'field';
        } else if (isCELLiteral(right)) {
          value = evalCELLiteralValue(right);
        }
      } else {
        /* istanbul ignore else */
        if (isCELIdentifierOrChain(right) && isCELLiteral(left) && expr.operator !== 'in') {
          flip = true;
          field = getIdentifierFromChain(right);
          value = evalCELLiteralValue(left);
        }
      }
      let operator = normalizeOperator(expr.operator, flip);
      if (forwardedNegation) {
        operator = defaultOperatorNegationMap[operator];
      }
      if (value === null && (operator === '=' || operator === '!=')) {
        operator = operator === '=' ? 'null' : 'notNull';
      } else if ((operator === 'in' || operator === 'notIn') && isCELList(right)) {
        if (right.value.value.every(isCELLiteral)) {
          value = right.value.value.map(evalCELLiteralValue);
        } else {
          if (right.value.value.every(isCELIdentifierOrChain)) {
            valueSource = 'field';
            value = right.value.value.map(id => getIdentifierFromChain(id));
          }
        }
        if (value && !listsAsArrays) {
          value = joinWith(
            value.map((v: string | boolean | number) => `${v}`),
            ','
          );
        }
      } else if ((operator === 'in' || operator === 'notIn') && isCELMap(right)) {
        const keys = right.value.value.map(v => v.left);
        if (keys.every(k => isCELLiteral(k) || isCELIdentifierOrChain(k))) {
          value = (keys as (CELLiteral | CELIdentifier)[]).map(k =>
            isCELLiteral(k) ? evalCELLiteralValue(k) : getIdentifierFromChain(k)
          );
        }
        if (value && !listsAsArrays) {
          value = joinWith(
            value.map((v: string | boolean | number) => `${v}`),
            ','
          );
        }
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

  let processedCEL: CELExpression;
  try {
    processedCEL = celParser.parse(cel).value;
  } catch (err) {
    return emptyQuery;
  }
  const result = processCELExpression(processedCEL);
  if (result) {
    if (isRuleGroup(result)) {
      return result;
    }
    return { rules: [result], ...(ic ? {} : { combinator: 'and' }) };
  }

  return emptyQuery;
}

export { parseCEL };
