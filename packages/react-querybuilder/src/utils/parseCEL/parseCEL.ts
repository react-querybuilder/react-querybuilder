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
} from '@react-querybuilder/ts/src/index.noReact';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { celParser } from './celParser';
import type { CELExpression, CELIdentifier, CELLiteral } from './types';
import {
  evalCELLiteralValue,
  generateFlatAndOrList,
  generateMixedAndOrList,
  isCELConditionalAnd,
  isCELConditionalOr,
  isCELExpressionGroup,
  isCELIdentifier,
  isCELLikeExpression,
  isCELList,
  isCELLiteral,
  isCELMap,
  isCELNegation,
  isCELRelation,
  isCELStringLiteral,
  normalizeOperator,
} from './utils';

/**
 * Converts a CEL string expression into a query suitable for
 * the QueryBuilder component's `query` or `defaultQuery` props.
 */
function parseCEL(cel: string): DefaultRuleGroupType;
function parseCEL(
  cel: string,
  options: Omit<ParseCELOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
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
    if (isCELNegation(expr)) {
      const negate = expr.negations % 2 === 1;
      // TODO?: forwardNegation when isCELRelation(expr.value.value), in addition
      // to CELLikeExpression? ('<=' becomes '>', 'in' becomes 'notIn', etc.)
      const negatedExpr =
        isCELExpressionGroup(expr.value) && isCELLikeExpression(expr.value.value)
          ? processCELExpression(expr.value.value, { forwardNegation: negate })
          : processCELExpression(expr.value, {
              groupOnlyIfNecessary: true,
              forwardNegation: negate,
            });
      if (negatedExpr) {
        if (
          !negate ||
          (negate && !('rules' in negatedExpr) && negatedExpr.operator.startsWith('doesNot'))
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
        if ('rules' in rule || (groupOnlyIfNecessary && isCELExpressionGroup(expr.value))) {
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
              rules: exp
                .map(e => processCELExpression(e))
                .filter(r => !!r) as DefaultRuleGroupArray,
            };
          }
          return processCELExpression(exp) as DefaultRuleType | DefaultRuleGroupType | null;
        })
        .filter(r => !!r) as DefaultRuleGroupArray;
      /* istanbul ignore else */
      if (rules.length > 0) {
        return { combinator, rules };
      }
    } else if (isCELLikeExpression(expr)) {
      const {
        left: { value: field },
        right: { value: func },
      } = expr;
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
      let value: any = undefined;
      let valueSource: ValueSource | undefined = undefined;
      let flip = false;
      const { left, right } = expr;
      if (isCELIdentifier(left)) {
        field = left.value;
        if (isCELIdentifier(right)) {
          value = right.value;
          valueSource = 'field';
        } else if (isCELLiteral(right)) {
          value = evalCELLiteralValue(right);
        }
      } else {
        /* istanbul ignore else */
        if (isCELIdentifier(right) && isCELLiteral(left) && expr.operator !== 'in') {
          flip = true;
          field = right.value;
          value = evalCELLiteralValue(left);
        }
      }
      let operator = normalizeOperator(expr.operator, flip);
      if (value === null && (operator === '=' || operator === '!=')) {
        operator = operator === '=' ? 'null' : 'notNull';
      } else if (operator === 'in' && isCELList(right)) {
        if (right.value.value.every(isCELLiteral)) {
          value = right.value.value.map(evalCELLiteralValue);
        } else {
          if (right.value.value.every(isCELIdentifier)) {
            valueSource = 'field';
            value = right.value.value.map(id => id.value);
          }
        }
        if (value && !listsAsArrays) {
          value = value.map((v: string | boolean | number) => `${v}`).join(',');
        }
      } else if (operator === 'in' && isCELMap(right)) {
        const keys = right.value.value.map(v => v.left);
        if (keys.every(k => isCELLiteral(k) || isCELIdentifier(k))) {
          value = (keys as (CELLiteral | CELIdentifier)[]).map(k =>
            isCELLiteral(k) ? evalCELLiteralValue(k) : k.value
          );
        }
        if (value && !listsAsArrays) {
          value = value.map((v: string | boolean | number) => `${v}`).join(',');
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
    if ('rules' in result) {
      return result;
    }
    return { rules: [result], ...(ic ? {} : { combinator: 'and' }) };
  }

  return emptyQuery;
}

export { parseCEL };
