import type {
  DefaultOperatorName,
  ExpressionNode,
  FormatQueryFinalOptions,
  RuleGroupType,
  RuleProcessor,
  RuleType,
} from '../../types';
import { toArray } from '../arrayUtils';
import type {
  FormatRAQBContext,
  RAQBFuncArgValue,
  RAQBFuncValue,
  RAQBJsonRule,
  RAQBJsonRuleGroup,
  RAQBValueSource,
} from '../parseRAQB/types';
import {
  combinatorToRaqbConjunction,
  matchModeToRaqbOperatorMap,
  raqbFuncArgNames,
  raqbBinaryOperators,
  raqbListOperators,
  raqbNullaryOperators,
  raqbThresholdOperators,
  relativeDateTimeToRaqbFunc,
  rqbToRaqbFunctionMap,
  rqbToRaqbMultiselectOperatorMap,
  rqbToRaqbOperatorMap,
  rqbToRaqbSelectOperatorMap,
} from '../parseRAQB/utils';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorRAQB } from './defaultRuleGroupProcessorRAQB';
import { processMatchMode } from './utils';

/** RQB `inputType`/`valueEditorType` values mapped to RAQB `valueType`s. */
const raqbValueTypeMap: Record<string, string> = {
  text: 'text',
  textarea: 'text',
  number: 'number',
  date: 'date',
  time: 'time',
  'datetime-local': 'datetime',
  datetime: 'datetime',
  select: 'select',
  multiselect: 'multiselect',
  checkbox: 'boolean',
  switch: 'boolean',
  radio: 'select',
};

/**
 * Selects the RAQB operator key for a rule, preferring the `select_*`/`multiselect_*` variants
 * when the field renders as a select. Returns `undefined` when RAQB has no equivalent.
 */
const getRaqbOperator = (
  operator: string,
  valueEditorType: unknown,
  operatorMap: Record<string, string>
): string | undefined => {
  const op = operator as DefaultOperatorName;
  const variantMap =
    valueEditorType === 'multiselect'
      ? rqbToRaqbMultiselectOperatorMap
      : valueEditorType === 'select' || valueEditorType === 'radio'
        ? rqbToRaqbSelectOperatorMap
        : null;

  return operatorMap[op] ?? variantMap?.[op] ?? rqbToRaqbOperatorMap[op];
};

/**
 * Default rule processor used by {@link formatQuery} for "raqb" format. Produces a RAQB
 * `rule` item, or a `rule_group` item for rules with a `match` mode.
 *
 * @group Export
 */
export const defaultRuleProcessorRAQB: RuleProcessor = (
  rule,
  // v8 ignore next
  options = {}
): RAQBJsonRule | RAQBJsonRuleGroup | false => {
  const { fieldData, context } = options;
  const {
    raqbFieldSeparator = '.',
    raqbOperatorMap = {},
    raqbFunctionMap = {},
    raqbFuncArgOrder = {},
    raqbRelativeDateTimes = true,
    raqbValueTypes = false,
  } = (context ?? {}) as FormatRAQBContext;

  const functionMap = { ...rqbToRaqbFunctionMap, ...raqbFunctionMap };

  const valueType = (): string | undefined => {
    if (!raqbValueTypes) return undefined;
    const key = (fieldData?.inputType ?? fieldData?.valueEditorType) as string | undefined;
    return typeof key === 'string' ? raqbValueTypeMap[key] : undefined;
  };

  /** Converts an RQB expression node to a RAQB function value (or a plain operand). */
  const processExpression = (
    node: ExpressionNode
  ): { value: unknown; valueSrc: RAQBValueSource } | null => {
    switch (node.kind) {
      case 'field': {
        return { value: node.field, valueSrc: 'field' };
      }
      case 'value': {
        return { value: node.value, valueSrc: 'value' };
      }
      case 'func': {
        const fn = functionMap[node.fn] ?? node.fn;
        const argNames = raqbFuncArgOrder[fn] ?? raqbFuncArgNames[fn];
        const args: Record<string, RAQBFuncArgValue> = {};
        for (const [index, arg] of node.args.entries()) {
          const processed = processExpression(arg);
          // A `parameter` node (or anything else RAQB can't express) invalidates the call.
          if (!processed) return null;
          args[argNames?.[index] ?? `arg${index}`] = {
            value: processed.value,
            valueSrc: processed.valueSrc,
          };
        }
        return { value: { func: fn, args } satisfies RAQBFuncValue, valueSrc: 'func' };
      }
      // `parameter` nodes have no RAQB equivalent.
      default: {
        return null;
      }
    }
  };

  /** Converts a single RQB operand to its RAQB `value`/`valueSrc` pair. */
  const processOperand = (
    value: unknown,
    valueSource: RuleType['valueSource']
  ): { value: unknown; valueSrc: RAQBValueSource } | null => {
    if (valueSource === 'parameter') return null;

    if (valueSource === 'field') {
      return { value, valueSrc: 'field' };
    }

    if (valueSource === 'expression') {
      return typeof value === 'object' && value !== null
        ? processExpression(value as ExpressionNode)
        : null;
    }

    if (raqbRelativeDateTimes) {
      const func = relativeDateTimeToRaqbFunc(value);
      if (func) return { value: func, valueSrc: 'func' };
    }

    return { value, valueSrc: 'value' };
  };

  // #region Match modes → RAQB `rule_group`
  const matchEval = processMatchMode(rule);

  if (matchEval === false) return false;

  if (matchEval) {
    const { mode, threshold } = matchEval;
    const operator = matchModeToRaqbOperatorMap[mode];
    /* v8 ignore next -- every MatchMode has an entry */
    if (!operator) return false;

    const subQuery = rule.value as RuleGroupType;
    // RAQB stores sub-query rules under their fully-qualified path (e.g. `cars.vendor`), while
    // RQB uses bare `subproperties` names. Prefix any that aren't already qualified.
    const prefix = `${rule.field}${raqbFieldSeparator}`;
    const inner = defaultRuleGroupProcessorRAQB(
      transformQuery(subQuery, {
        ruleProcessor: r => ({
          ...r,
          field: !r.field || r.field.startsWith(prefix) ? r.field : `${prefix}${r.field}`,
        }),
      }),
      {
        ...(options as FormatQueryFinalOptions),
        ruleProcessor: defaultRuleProcessorRAQB,
      }
    );

    const ruleGroup: RAQBJsonRuleGroup = {
      type: 'rule_group',
      properties: {
        field: rule.field,
        mode: 'array',
        operator,
        value: raqbThresholdOperators.has(operator) ? [threshold] : [],
        valueSrc: raqbThresholdOperators.has(operator) ? ['value'] : [],
        conjunction: combinatorToRaqbConjunction(subQuery.combinator),
        ...(subQuery.not ? { not: true } : null),
      },
      children1: inner.children1,
    };
    if (rule.id) {
      ruleGroup.id = rule.id;
    }
    return ruleGroup;
  }
  // #endregion

  // #region LHS
  const properties: RAQBJsonRule['properties'] = { field: rule.field };

  if (rule.lhs) {
    const lhs = processExpression(rule.lhs);
    if (!lhs) return false;
    if (lhs.valueSrc === 'func') {
      properties.field = lhs.value as RAQBFuncValue;
      properties.fieldSrc = 'func';
    }
  }
  // #endregion

  const operator = getRaqbOperator(rule.operator, fieldData?.valueEditorType, raqbOperatorMap);
  if (!operator) return false;
  properties.operator = operator;

  // #region RHS
  if (raqbNullaryOperators.has(operator)) {
    properties.value = [];
    properties.valueSrc = [];
    return finalize(rule, properties);
  }

  const vt = valueType();

  if (raqbBinaryOperators.has(operator)) {
    const [first, second] = toArray(rule.value, { retainEmptyStrings: true });
    const operands = [
      processOperand(first, rule.valueSource),
      processOperand(second, rule.valueSource),
    ];
    if (operands.some(o => o === null)) return false;
    properties.value = operands.map(o => o!.value);
    properties.valueSrc = operands.map(o => o!.valueSrc);
    if (vt) {
      properties.valueType = [vt, vt];
    }
    return finalize(rule, properties);
  }

  if (raqbListOperators.has(operator) && (rule.valueSource ?? 'value') === 'value') {
    properties.value = [toArray(rule.value, { retainEmptyStrings: true })];
    properties.valueSrc = ['value'];
    if (vt) {
      properties.valueType = ['multiselect'];
    }
    return finalize(rule, properties);
  }

  const operand = processOperand(rule.value, rule.valueSource);
  if (!operand) return false;
  properties.value = [operand.value];
  properties.valueSrc = [operand.valueSrc];
  if (vt) {
    properties.valueType = [vt];
  }
  // #endregion

  return finalize(rule, properties);
};

const finalize = (rule: RuleType, properties: RAQBJsonRule['properties']): RAQBJsonRule => {
  const raqbRule: RAQBJsonRule = { type: 'rule', properties };
  if (rule.id) {
    raqbRule.id = rule.id;
  }
  return raqbRule;
};
