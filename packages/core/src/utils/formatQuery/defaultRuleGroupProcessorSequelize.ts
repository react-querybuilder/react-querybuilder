import type { Op as _OpTypes } from 'sequelize';
import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';

type OpTypes = typeof _OpTypes;

/**
 * Structural stand-in for Sequelize's `WhereOptions`. Declared locally so the public type surface
 * of this package never references `sequelize`, which is an optional peer dependency.
 * (Referencing it would force consumers to install it to typecheck without `skipLibCheck`.)
 * Assignable to `WhereOptions` at the call site, e.g. `Model.findAll({ where })`.
 *
 * @group Export
 */
export interface SequelizeWhereOptionsLike {
  [key: string | symbol]: unknown;
}

/**
 * Rule group processor used by {@link formatQuery} for "sequelize" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorSequelize: RuleGroupProcessor<
  SequelizeWhereOptionsLike | undefined
> = (ruleGroup, options) => {
  // v8 ignore next
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

  if (!Op) return undefined;

  const processRuleGroup = (
    rg: RuleGroupType,
    _outermost?: boolean
  ): SequelizeWhereOptionsLike | undefined => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return undefined;
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
          return undefined;
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
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
          fieldData,
        });
      })
      .filter(Boolean);

    if (expressions.length === 0) return undefined;

    const result =
      expressions.length === 1 && !hasChildRules
        ? expressions[0]
        : { [lc(combinator) === 'or' ? Op.or : Op.and]: expressions };

    return rg.not ? { [Op.not]: result } : result;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
