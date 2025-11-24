import type { Column, Operators, SQL, Table } from 'drizzle-orm';
import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';
import { defaultRuleProcessorDrizzle } from './defaultRuleProcessorDrizzle';

/**
 * Default rule group processor used by {@link formatQuery} for the "drizzle" format. The returned
 * function can be assigned to the `where` property in the Drizzle relational queries API.
 *
 * @example
 * const where = formatQuery(query, 'drizzle');
 * const results = db.query.users.findMany({ where });
 *
 * @returns Function that takes a Drizzle table config and an object of Drizzle operators.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorDrizzle: RuleGroupProcessor<
  (columns: Record<string, Column> | Table, drizzleOperators: Operators) => SQL | undefined
> =
  (ruleGroup, options, _meta) =>
  (columns: Table | Record<string, Column>, drizzleOperators: Operators) => {
    const {
      fields,
      getParseNumberBoolean,
      placeholderFieldName,
      placeholderOperatorName,
      placeholderValueName,
      validateRule,
      validationMap,
    } = options;

    if (!columns || !drizzleOperators) return;

    const { and, not, or } = drizzleOperators;

    const ruleProcessor = defaultRuleProcessorDrizzle;

    const processRuleGroup = (rg: RuleGroupType, _outermost?: boolean): SQL | undefined => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next -- @preserve */ ''])) {
        return;
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
            return;
          }
          const fieldData = getOption(fields, rule.field);
          return ruleProcessor(rule, {
            ...options,
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
            fieldData,
            context: { ...options.context, columns, drizzleOperators },
          });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return;
      }

      const ruleGroupSQL: SQL | undefined =
        rg.combinator === 'or' ? or(...processedRules)! : and(...processedRules)!;

      return rg.not ? not(ruleGroupSQL) : ruleGroupSQL;
    };

    return processRuleGroup(convertFromIC(ruleGroup), true);
  };
