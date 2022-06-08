import { fieldIsValidUtil, getFieldsArray } from '../../internal';
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
import { celParser } from './celParser';
import type { CELExpression } from './types';
import {
  convertRelop,
  evalCELLiteralValue,
  generateFlatAndOrList,
  generateMixedAndOrList,
  isCELConditionalAnd,
  isCELConditionalOr,
  isCELExpressionGroup,
  isCELIdentifier,
  isCELLikeExpression,
  isCELLiteral,
  isCELNegation,
  isCELRelation,
  isCELStringLiteral,
} from './utils';

/**
 * Converts a CEL string expression into a query suitable for
 * the QueryBuilder component's `query` or `defaultQuery` props.
 */
function parseCEL(cel: string): DefaultRuleGroupType;
function parseCEL(
  cel: string,
  options: Omit<ParseCELOptions, 'independentCombinators'> & { independentCombinators?: false }
): DefaultRuleGroupType;
function parseCEL(
  cel: string,
  options: Omit<ParseCELOptions, 'independentCombinators'> & { independentCombinators: true }
): DefaultRuleGroupTypeIC;
function parseCEL(cel: string, options: ParseCELOptions = {}): DefaultRuleGroupTypeAny {
  const { independentCombinators, fields } = options;
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

  const emptyQuery: DefaultRuleGroupTypeAny = { rules: [], ...(ic ? {} : { combinator: 'and' }) };

  const processCELExpression = (
    expr: CELExpression,
    processOpts: { groupOnlyIfNecessary?: boolean; forwardNegation?: boolean } = {}
  ): DefaultRuleType | DefaultRuleGroupTypeAny | null => {
    const { forwardNegation, groupOnlyIfNecessary } = processOpts;
    /* istanbul ignore if */
    if (isCELNegation(expr)) {
      const negate = expr.negations.value.length % 2 === 1;
      const negatedExpr = processCELExpression(expr.value, {
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
            : ({ combinator: 'and', rules: [negatedExpr] } as DefaultRuleGroupType);
        }
        return ic
          ? ({ rules: [negatedExpr], not: true } as DefaultRuleGroupTypeIC)
          : ({ combinator: 'and', rules: [negatedExpr], not: true } as DefaultRuleGroupType);
      }
    } else if (isCELExpressionGroup(expr)) {
      const rule = processCELExpression(expr.value);
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
      const operator = forwardNegation
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
        if (isCELIdentifier(right) && isCELLiteral(left)) {
          field = right.value;
          value = evalCELLiteralValue(left);
        }
      }
      let operator = convertRelop(expr.operator);
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
