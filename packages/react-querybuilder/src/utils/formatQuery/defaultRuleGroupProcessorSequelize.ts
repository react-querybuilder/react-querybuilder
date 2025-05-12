import type { Op as _OpTypes, WhereOptions } from 'sequelize';
import type { RuleGroupProcessor, RuleGroupType } from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

type OpTypes = typeof _OpTypes;

/**
 * Rule group processor used by {@link formatQuery} for "sequelize" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorSequelize: RuleGroupProcessor<WhereOptions | undefined> = (
  ruleGroup,
  options
) => {
  // istanbul ignore next
  const {
    fields,
    getParseNumberBoolean,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    ruleProcessor,
    validateRule,
    validationMap,
    context = {},
  } = options;

  const { sequelizeOperators: Op } = context as {
    sequelizeOperators: OpTypes;
  };

  if (!Op) return;

  const processRuleGroup = (rg: RuleGroupType, _outermost?: boolean): WhereOptions | undefined => {
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return;
    }

    const combinator = rg.combinator.toUpperCase();
    let hasChildRules = false;

    const expressions: Record<string, unknown>[] = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          const processedRuleGroup = processRuleGroup(rule);
          if (processedRuleGroup) {
            hasChildRules = true;
            return processedRuleGroup;
          }
          return;
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* istanbul ignore next */
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          return;
        }
        const fieldData = getOption(fields, rule.field);
        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          fieldData,
        });
      })
      .filter(Boolean);

    if (expressions.length === 0) return;

    const result =
      expressions.length === 1 && !hasChildRules
        ? expressions[0]
        : { [combinator.toLowerCase() === 'or' ? Op.or : Op.and]: expressions };

    return rg.not ? { [Op.not]: result } : result;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
