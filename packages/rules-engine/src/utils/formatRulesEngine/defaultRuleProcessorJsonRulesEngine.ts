import { transformQuery, type RuleProcessor } from '@react-querybuilder/core';
import type { ConditionProperties } from 'json-rules-engine';

export const defaultRuleProcessorJsonRulesEngine: RuleProcessor = (
  rule,
  _opts
): ConditionProperties =>
  transformQuery(
    { combinator: 'and', rules: [rule] },
    {
      propertyMap: { field: 'fact' },
      deleteRemappedProperties: true,
      omitPath: true,
      operatorMap: {
        '=': 'equal',
        '!=': 'notEqual',
        '<': 'lessThan',
        '<=': 'lessThanInclusive',
        '>': 'greaterThan',
        '>=': 'greaterThanInclusive',
      },
    }
  ).rules[0];
