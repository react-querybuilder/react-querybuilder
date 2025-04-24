import type { Column, ColumnBaseConfig, ColumnDataType, SQL, Table } from 'drizzle-orm';
import { and, not, or } from 'drizzle-orm';
import type { RuleGroupProcessor, RuleGroupType } from 'react-querybuilder';
import {
  convertFromIC,
  getOption,
  isRuleGroup,
  isRuleGroupType,
  isRuleOrGroupValid,
} from 'react-querybuilder';
import { generateDrizzleRuleProcessor } from './generateDrizzleRuleProcessor';

export const generateDrizzleRuleGroupProcessor =
  (
    table: Table | Record<string, Column<ColumnBaseConfig<ColumnDataType, string>>>
  ): RuleGroupProcessor<false | SQL> =>
  (ruleGroup, options, _meta) => {
    const {
      fields,
      getParseNumberBoolean,
      placeholderFieldName,
      placeholderOperatorName,
      placeholderValueName,
      validateRule,
      validationMap,
    } = options;
    const query = isRuleGroupType(ruleGroup) ? ruleGroup : convertFromIC(ruleGroup);
    const ruleProcessor = generateDrizzleRuleProcessor(table);

    const processRuleGroup = (rg: RuleGroupType, _outermost?: boolean): SQL | false => {
      if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
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
            /* istanbul ignore next */
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

      const ruleGroupSQL: SQL | undefined =
        rg.combinator === 'or' ? or(...processedRules) : and(...processedRules);

      return ruleGroupSQL ? (rg.not ? not(ruleGroupSQL) : ruleGroupSQL) : false;
    };

    return processRuleGroup(query, true);
  };
