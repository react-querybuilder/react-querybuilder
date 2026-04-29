import type { DefaultCombinatorName, RuleGroupProcessor, RuleGroupTypeAny } from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Maps a {@link DefaultCombinatorName} to a Cypher combinator keyword.
 *
 * @group Export
 */
export const cypherCombinatorMap: {
  and: 'AND';
  or: 'OR';
} = {
  and: 'AND',
  or: 'OR',
} satisfies Record<DefaultCombinatorName, 'AND' | 'OR'>;

/**
 * Rule group processor used by {@link formatQuery} for "cypher" and "gql" formats.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorCypher: RuleGroupProcessor<string> = (ruleGroup, options) => {
  const {
    fields,
    fallbackExpression,
    getParseNumberBoolean,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    ruleProcessor,
    validateRule,
    validationMap,
  } = options;

  const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean): string => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return outermost ? fallbackExpression : '';
    }

    const processedRules = [];
    let precedingCombinator = '';
    let firstRule = true;

    for (const rule of rg.rules) {
      // Independent combinators
      if (typeof rule === 'string') {
        precedingCombinator = cypherCombinatorMap[rule as DefaultCombinatorName];
        continue;
      }

      // Groups
      if (isRuleGroup(rule)) {
        const processedGroup = processRuleGroup(rule);
        if (processedGroup) {
          if (!firstRule && precedingCombinator) {
            processedRules.push(precedingCombinator);
            precedingCombinator = '';
          }
          firstRule = false;
          processedRules.push(processedGroup);
        }
        continue;
      }

      // Rules
      const [validationResult, fieldValidator] = validateRule(rule);
      if (
        !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
        rule.field === placeholderFieldName ||
        rule.operator === placeholderOperatorName ||
        /* v8 ignore next -- @preserve */
        (placeholderValueName !== undefined && rule.value === placeholderValueName)
      ) {
        continue;
      }

      const fieldData = getOption(fields, rule.field);
      const processedRule = ruleProcessor(rule, {
        ...options,
        parseNumbers: getParseNumberBoolean(fieldData?.inputType),
        escapeQuotes: (rule.valueSource ?? 'value') === 'value',
        fieldData,
      });

      if (processedRule) {
        if (!firstRule && precedingCombinator) {
          processedRules.push(precedingCombinator);
          precedingCombinator = '';
        }
        firstRule = false;
        processedRules.push(processedRule);
      }
    }

    const expression = processedRules.join(
      isRuleGroupType(rg) ? ` ${cypherCombinatorMap[rg.combinator as DefaultCombinatorName]} ` : ' '
    );

    const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? 'NOT ' : ''}(`, ')'] : ['', ''];

    return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
  };

  return processRuleGroup(ruleGroup, true);
};
