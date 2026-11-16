import type { RuleGroupProcessor, RuleGroupTypeAny } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup, isRuleGroupTypeIC } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "gremlin" format.
 *
 * At the top level, filter rules produce chained `.has()` steps (implicit AND) unless the group
 * is negated, uses "or", or uses independent combinators (then nested form is used).
 * Nested groups use `.and()` / `.or()` / `.not()` compound traversals with
 * `__` anonymous traversal prefixes. Since `not()` accepts exactly one
 * traversal, negated groups with multiple predicates wrap them in a single
 * `__.and()`/`__.or()` sub-traversal.
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
  const processNested = (rgAny: RuleGroupTypeAny): string => {
    const rg = convertFromIC(rgAny);
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

    const combinator = lc(rg.combinator);

    if (predicates.length === 1 && !rg.not) return predicates[0];

    // Wrap each step with `__` anonymous traversal prefix when it starts with `.`
    const args = predicates.map(p => (p.startsWith('.') ? `__${p}` : p)).join(', ');

    // `not()` accepts exactly one traversal, so multiple predicates must be
    // combined into a single `__.and()`/`__.or()` sub-traversal first.
    if (rg.not) {
      return predicates.length === 1 ? `.not(${args})` : `.not(__.${combinator}(${args}))`;
    }

    return `.${combinator}(${args})`;
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

  if (ruleGroup.not || isRuleGroupTypeIC(ruleGroup) || lc(ruleGroup.combinator) !== 'and') {
    return processNested(ruleGroup) || fallbackExpression;
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
