import type {
  DefaultCombinatorName,
  RQBJsonLogic,
  RuleGroupProcessor,
  RuleGroupType,
} from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "jsonlogic" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorJsonLogic: RuleGroupProcessor<RQBJsonLogic> = (
  ruleGroup,
  options
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

  const query = convertFromIC(ruleGroup);

  const processRuleGroup = (rg: RuleGroupType, _outermost?: boolean): RQBJsonLogic => {
    if (
      !isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next -- @preserve */ ''])
    ) {
      return false;
    }

    const processedRules = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* istanbul ignore next -- @preserve */
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          return false;
        }
        const fieldData = getOption(fields, rule.field);
        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          fieldData,
        });
      })
      .filter(Boolean);

    if (processedRules.length === 0) {
      return false;
    }

    const jsonRuleGroup: RQBJsonLogic = { [rg.combinator]: processedRules } as {
      [k in DefaultCombinatorName]: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
    };

    return rg.not ? { '!': jsonRuleGroup } : jsonRuleGroup;
  };

  return processRuleGroup(query, true);
};
