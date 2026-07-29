import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';
import type { RAQBJsonItem, RAQBJsonTree } from '../parseRAQB/types';
import { combinatorToRaqbConjunction } from '../parseRAQB/utils';

/**
 * Default fallback tree used by {@link formatQuery} for "raqb" format.
 *
 * @group Export
 */
export const raqbFallback: RAQBJsonTree = {
  type: 'group',
  properties: { conjunction: 'AND', not: false },
  children1: [],
};

/**
 * Rule group processor used by {@link formatQuery} for "raqb" format. Produces a
 * [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder) query
 * tree in its plain-JSON form, suitable for RAQB's `Utils.loadTree()`.
 *
 * Inverse of `parseRAQB`.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorRAQB: RuleGroupProcessor<RAQBJsonTree> = (
  ruleGroup,
  options,
  meta
) => {
  const {
    fields,
    getParseNumberBoolean,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    ruleProcessor,
    validateRule,
    validationMap,
  } = options;

  const processRuleGroup = (rg: RuleGroupType, outermost?: boolean): RAQBJsonTree | false => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return outermost ? raqbFallback : false;
    }

    const children1 = rg.rules
      .map((rule): RAQBJsonItem | false => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* v8 ignore next -- @preserve */
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          return false;
        }
        const fieldData = getOption(fields, rule.field);
        return ruleProcessor(
          rule,
          {
            ...options,
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
            fieldData,
          },
          meta
        );
      })
      .filter(Boolean) as RAQBJsonItem[];

    if (children1.length === 0 && !outermost) {
      return false;
    }

    const group: RAQBJsonTree = {
      type: 'group',
      properties: {
        conjunction: combinatorToRaqbConjunction(rg.combinator),
        not: !!rg.not,
      },
      children1,
    };
    if (rg.id) {
      group.id = rg.id;
    }
    return group;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true) as RAQBJsonTree;
};
