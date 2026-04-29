import type { RuleGroupProcessor, RuleGroupType, RuleGroupTypeAny } from '../../types';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "gremlin" format.
 *
 * At the top level, filter rules produce chained `.has()` steps (implicit AND).
 * Nested groups use `.and()` / `.or()` / `.not()` compound traversals with
 * `__` anonymous traversal prefixes.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorGremlin: RuleGroupProcessor<string> = (
  ruleGroup,
  options
) => {
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

  const validateAndProcess = (rule: (typeof ruleGroup.rules)[number]) => {
    // v8 ignore next -- @preserve
    if (typeof rule === 'string' || isRuleGroup(rule)) return undefined;

    const [validationResult, fieldValidator] = validateRule(rule);
    if (
      !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
      /* v8 ignore next 2 -- @preserve */
      rule.field === placeholderFieldName ||
      rule.operator === placeholderOperatorName ||
      /* v8 ignore next -- @preserve */
      (placeholderValueName !== undefined && rule.value === placeholderValueName)
    ) {
      return undefined;
    }

    const fieldData = getOption(fields, rule.field);
    return ruleProcessor(rule, {
      ...options,
      parseNumbers: getParseNumberBoolean(fieldData?.inputType),
      escapeQuotes: (rule.valueSource ?? 'value') === 'value',
      fieldData,
    });
  };

  /** Recursively processes a nested group into `.and()`/`.or()`/`.not()` form. */
  const processNested = (rg: RuleGroupTypeAny): string => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return '';
    }

    const predicates: string[] = [];

    for (const rule of rg.rules) {
      if (typeof rule === 'string') continue;

      if (isRuleGroup(rule)) {
        const nested = processNested(rule);
        if (nested) predicates.push(nested);
        continue;
      }

      const processed = validateAndProcess(rule);
      if (processed) predicates.push(processed);
    }

    if (predicates.length === 0) return '';

    const combinator = (rg as RuleGroupType).combinator ?? 'and';
    const prefix = rg.not ? 'not' : combinator;

    if (predicates.length === 1 && !rg.not) return predicates[0];

    // Wrap each step with `__` anonymous traversal prefix when it starts with `.`
    const args = predicates.map(p => (p.startsWith('.') ? `__${p}` : p)).join(', ');
    return `.${prefix}(${args})`;
  };

  // Top level: chain steps directly (implicit AND for outermost group)
  if (
    !isRuleOrGroupValid(
      ruleGroup,
      validationMap[
        ruleGroup.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
      ]
    )
  ) {
    return fallbackExpression;
  }

  const steps: string[] = [];

  for (const rule of ruleGroup.rules) {
    if (typeof rule === 'string') continue;

    if (isRuleGroup(rule)) {
      const compound = processNested(rule);
      if (compound) steps.push(compound);
      continue;
    }

    const processed = validateAndProcess(rule);
    if (processed) steps.push(processed);
  }

  if (steps.length === 0) return fallbackExpression;

  return steps.join('');
};
