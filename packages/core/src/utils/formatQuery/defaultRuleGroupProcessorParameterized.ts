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
import { filterRulesAndCleanupCombinators } from './utils';

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

    const cleanedRules = filterRulesAndCleanupCombinators(rg);

    const processedRules = cleanedRules
      .map(rule => {
        if (typeof rule === 'string') {
          return rule;
        }
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule, rg.rules.length === 1);
        }
        return processRule(rule);
      })
      .filter(Boolean);

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
