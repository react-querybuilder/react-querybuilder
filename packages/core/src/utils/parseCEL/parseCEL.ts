import type { Except } from 'type-fest';
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
  MatchMode,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  ValueSource,
} from '../../types';
import type { ParserCommonOptions } from '../../types/import';
import { joinWith } from '../arrayUtils';
import { isRuleGroup } from '../isRuleGroup';
import { fieldIsValidUtil, getFieldsArray } from '../parserUtils';
import { prepareRuleGroup } from '../prepareQueryObjects';
import { CELParser } from './celParser';
import type {
  CELExpression,
  CELIdentifier,
  CELLikeExpression,
  CELLiteral,
  ParsedCEL,
} from './types';
import {
  celGenerateFlatAndOrList,
  celGenerateMixedAndOrList,
  celNormalizeOperator,
  evalCELLiteralValue,
  extractSubqueryComponents,
  getCELIdentifierFromChain,
  getCELIdentifierFromNegatedChain,
  isCELConditionalAnd,
  isCELConditionalOr,
  isCELExpressionGroup,
  isCELIdentifier,
  isCELIdentifierOrChain,
  isCELLikeExpression,
  isCELList,
  isCELLiteral,
  isCELMap,
  isCELNegatedLikeExpression,
  isCELNegatedSubqueryExpression,
  isCELNegation,
  isCELRelation,
  isCELStringLiteral,
  isCELSubqueryExpression,
  transformAliasInExpression,
} from './utils';

export interface ParseCELOptionsStandard
  extends Except<ParserCommonOptions, 'independentCombinators'> {
  independentCombinators?: false;
  /**
   * Handler for custom CEL expressions.
   */
  customExpressionHandler?: (expr: CELExpression) => RuleType | RuleGroupType | null;
}
export interface ParseCELOptionsIC extends Except<ParserCommonOptions, 'independentCombinators'> {
  independentCombinators: true;
  /**
   * Handler for custom CEL expressions.
   */
  customExpressionHandler?: (expr: CELExpression) => RuleType | RuleGroupTypeIC | null;
}

/**
 * Options object for {@link parseCEL}.
 */
export type ParseCELOptions = ParseCELOptionsStandard | ParseCELOptionsIC;

/**
 * Converts a CEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseCEL(cel: string): DefaultRuleGroupType;
/**
 * Converts a CEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!RuleGroupType RuleGroupType}).
 */
function parseCEL(
  cel: string,
  options: ParseCELOptionsStandard & {
    customExpressionHandler: (expr: CELExpression) => RuleType | RuleGroupType | null;
  }
): RuleGroupType;
/**
 * Converts a CEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!RuleGroupTypeIC RuleGroupTypeIC}).
 */
function parseCEL(
  cel: string,
  options: ParseCELOptionsIC & {
    customExpressionHandler: (expr: CELExpression) => RuleType | RuleGroupTypeIC | null;
  }
): RuleGroupTypeIC;
/**
 * Converts a CEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupType DefaultRuleGroupType}).
 */
function parseCEL(cel: string, options?: ParseCELOptionsStandard): DefaultRuleGroupType;
/**
 * Converts a CEL string expression into a query suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `query` or `defaultQuery` props
 * ({@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}).
 */
function parseCEL(cel: string, options: ParseCELOptionsIC): DefaultRuleGroupTypeIC;
function parseCEL(cel: string, options: ParseCELOptions = {}): RuleGroupTypeAny {
  const { fields, independentCombinators, listsAsArrays, customExpressionHandler } = options;
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
        : (getCELIdentifierFromNegatedChain(expr.left).match(/^!+/)?.[0].length ?? 0) % 2 === 1;
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
                    value: getCELIdentifierFromNegatedChain(expr.left).replace(/^!+/, ''),
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
        const andOrList = celGenerateFlatAndOrList(expr);
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
      const andOrList = celGenerateMixedAndOrList(expr);
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
      const field = getCELIdentifierFromChain(expr.left);
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
    } else if (isCELSubqueryExpression(expr)) {
      const components = extractSubqueryComponents(expr);
      // istanbul ignore else
      if (components) {
        const { field, method, alias, condition } = components;

        const matchMode: MatchMode = method === 'all' ? 'all' : 'some';

        // Parse the condition expression recursively
        // Replace alias references in the condition with appropriate field paths
        const transformedCondition = transformAliasInExpression(condition, alias);
        const subqueryValue = processCELExpression(transformedCondition);

        if (subqueryValue && fieldIsValid(field, '=')) {
          // Wrap single rules in a rule group
          const ruleGroupValue = isRuleGroup(subqueryValue)
            ? subqueryValue
            : ic
              ? { rules: [subqueryValue] }
              : { combinator: 'and' as DefaultCombinatorName, rules: [subqueryValue] };

          return {
            field,
            operator: '=',
            match: { mode: matchMode },
            value: ruleGroupValue,
          };
        }
      }
    } else if (isCELNegatedSubqueryExpression(expr)) {
      const field = getCELIdentifierFromNegatedChain(expr.left).replace(/^!+/, '');
      const method = expr.right!.value as 'all' | 'exists';
      const [aliasExpr, conditionExpr] = expr.list!.value;
      const alias = isCELIdentifier(aliasExpr) ? aliasExpr.value : /* istanbul ignore next */ null;

      // For negated subqueries, we want to create a NOT rule group with the subquery inside
      const transformedCondition = transformAliasInExpression(conditionExpr, alias);
      const subqueryValue = processCELExpression(transformedCondition);

      // istanbul ignore else
      if (subqueryValue && fieldIsValid(field, '=')) {
        const ruleGroupValue = isRuleGroup(subqueryValue)
          ? subqueryValue
          : ic
            ? { rules: [subqueryValue] }
            : { combinator: 'and' as DefaultCombinatorName, rules: [subqueryValue] };

        // Determine match mode based on method (no forwarded negation since we handle it differently)
        const matchMode = method === 'all' ? 'all' : 'some';

        const subqueryRule: DefaultRuleType = {
          field,
          operator: '=',
          match: { mode: matchMode },
          value: ruleGroupValue,
        };

        // Return a negated rule group containing the subquery
        return ic
          ? { not: true, rules: [subqueryRule] }
          : { combinator: 'and' as DefaultCombinatorName, not: true, rules: [subqueryRule] };
      }
    } else if (isCELRelation(expr)) {
      let field: string | null = null;
      // oxlint-disable-next-line typescript/no-explicit-any
      let value: any = undefined;
      let valueSource: ValueSource | undefined = undefined;
      let flip = false;
      const { left, right } = expr;
      if (isCELIdentifierOrChain(left)) {
        field = getCELIdentifierFromChain(left);
        if (isCELIdentifierOrChain(right)) {
          value = getCELIdentifierFromChain(right);
          valueSource = 'field';
        } else if (isCELLiteral(right)) {
          value = evalCELLiteralValue(right);
        }
      } else {
        /* istanbul ignore else */
        if (isCELIdentifierOrChain(right) && isCELLiteral(left) && expr.operator !== 'in') {
          flip = true;
          field = getCELIdentifierFromChain(right);
          value = evalCELLiteralValue(left);
        }
      }
      let operator = celNormalizeOperator(expr.operator, flip);
      if (forwardedNegation) {
        operator = defaultOperatorNegationMap[operator];
      }
      if (value === null && (operator === '=' || operator === '!=')) {
        operator = operator === '=' ? 'null' : 'notNull';
      } else if ((operator === 'in' || operator === 'notIn') && isCELList(right)) {
        if (right.value.value.every(v => isCELLiteral(v))) {
          value = right.value.value.map(v => evalCELLiteralValue(v));
        } else {
          if (right.value.value.every(v => isCELIdentifierOrChain(v))) {
            valueSource = 'field';
            value = right.value.value.map(id => getCELIdentifierFromChain(id));
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
            isCELLiteral(k) ? evalCELLiteralValue(k) : getCELIdentifierFromChain(k)
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
        field !== null &&
        fieldIsValid(field, operator, valueSource === 'field' ? value : undefined) &&
        value !== undefined
      ) {
        return valueSource ? { field, operator, value, valueSource } : { field, operator, value };
      }
    } else if (customExpressionHandler) {
      return customExpressionHandler(expr) as DefaultRuleType | DefaultRuleGroupTypeAny | null;
    }
    return null;
  };

  const prepare = options.generateIDs ? prepareRuleGroup : <T>(g: T) => g;

  const celParser = new CELParser();
  let processedCEL: CELExpression;
  try {
    processedCEL = (celParser.parse(cel) as ParsedCEL).value;
  } catch {
    return prepare(emptyQuery);
  }
  const result = processCELExpression(processedCEL);
  if (result) {
    if (isRuleGroup(result)) {
      return prepare(result);
    }
    return prepare({ rules: [result], ...(ic ? {} : { combinator: 'and' }) });
  }

  return prepare(emptyQuery);
}

export { parseCEL };
