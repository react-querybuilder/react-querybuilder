import type {
  ParameterizedNamedSQL,
  ParameterizedSQL,
  RuleGroupProcessor,
  RuleGroupTypeAny,
  RuleType,
} from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { isPojo } from '../misc';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "parameterized" and
 * "parameterized_named" formats.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorParameterized: RuleGroupProcessor<
  ParameterizedSQL | ParameterizedNamedSQL
> = (ruleGroup, options) => {
  const {
    format,
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

  const parameterized = format === 'parameterized';
  // oxlint-disable-next-line typescript/no-explicit-any
  const params: any[] = [];
  // oxlint-disable-next-line typescript/no-explicit-any
  const paramsNamed: Record<string, any> = {};
  const fieldParams: Map<string, Set<string>> = new Map();

  const getNextNamedParam = (field: string) => {
    if (!fieldParams.has(field)) {
      fieldParams.set(field, new Set());
    }
    const nextNamedParam = `${field}_${fieldParams.get(field)!.size + 1}`;
    fieldParams.get(field)!.add(nextNamedParam);
    return nextNamedParam;
  };

  const processRule = (rule: RuleType) => {
    const [validationResult, fieldValidator] = validateRule(rule);
    if (
      !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
      rule.field === placeholderFieldName ||
      rule.operator === placeholderOperatorName ||
      /* istanbul ignore next */
      (placeholderValueName !== undefined && rule.value === placeholderValueName)
    ) {
      return '';
    }

    const fieldData = getOption(fields, rule.field);

    const fieldParamNames = Object.fromEntries(
      ([...fieldParams.entries()] as [string, Set<string>][]).map(([f, s]) => [f, [...s]])
    );

    const processedRule = ruleProcessor(
      rule,
      {
        ...options,
        parseNumbers: getParseNumberBoolean(fieldData?.inputType),
        getNextNamedParam,
        fieldParamNames,
        fieldData,
      },
      { processedParams: params }
    );

    if (!isPojo(processedRule)) {
      return '';
    }

    const { sql, params: customParams } = processedRule;

    if (typeof sql !== 'string' || !sql) {
      return '';
    }

    // istanbul ignore else
    if (format === 'parameterized' && Array.isArray(customParams)) {
      params.push(...customParams);
    } else if (format === 'parameterized_named' && isPojo(customParams)) {
      Object.assign(paramsNamed, customParams);
      // `getNextNamedParam` already adds new params to the list, but a custom
      // rule processor might not call it so we need to make sure we add
      // any new params here.
      for (const p of Object.keys(customParams)) fieldParams.get(rule.field)?.add(p);
    }

    return sql;
  };

  const processRuleGroup = (rg: RuleGroupTypeAny, outermostOrLonelyInGroup?: boolean): string => {
    // Skip muted groups
    if (rg.muted) {
      return '';
    }

    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      // TODO: test for the last case and remove "ignore" comment
      return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
    }

    const processedRules: string[] = [];
    let lastValidRuleIndex = -1;

    for (let i = 0; i < rg.rules.length; i++) {
      const rule = rg.rules[i];

      // Skip combinators for now, we'll handle them when we hit the next valid rule
      if (typeof rule === 'string') {
        continue;
      }

      // Skip muted rules/groups
      if (rule.muted) {
        continue;
      }

      let processedRule: string | undefined;

      if (isRuleGroup(rule)) {
        const result = processRuleGroup(
          rule,
          rg.rules.filter(r => typeof r !== 'string' && !r.muted).length === 1
        );
        if (result) {
          processedRule = result;
        }
      } else {
        const result = processRule(rule);
        if (result) {
          processedRule = result;
        }
      }

      if (processedRule) {
        // If this is not the first valid rule and we're in IC format, find the combinator
        if (lastValidRuleIndex >= 0 && !isRuleGroupType(rg)) {
          // Find the combinator that immediately precedes this valid rule
          let combinator: string | undefined;
          for (let j = i - 1; j >= 0; j--) {
            const item = rg.rules[j];
            if (typeof item === 'string') {
              combinator = item;
              break;
            }
            // Skip muted rules
            if (item.muted) {
              continue;
            }
            // If we hit a non-muted rule, stop looking
            break;
          }
          if (combinator) {
            processedRules.push(combinator);
          }
        }

        processedRules.push(processedRule);
        lastValidRuleIndex = i;
      }
    }

    if (processedRules.length === 0) {
      return fallbackExpression;
    }

    return `${rg.not ? 'NOT ' : ''}(${processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
  };

  if (parameterized) {
    return { sql: processRuleGroup(ruleGroup, true), params };
  }
  return { sql: processRuleGroup(ruleGroup, true), params: paramsNamed };
};
