import type {
  Classname,
  FlexibleOptionList,
  FullCombinator,
  FullOptionList,
  FullField,
  FullOperator,
  FullOptionRecord,
  InputType,
  MatchModeOptions,
  Option,
  OptionList,
  RuleGroupTypeAny,
  RuleType,
  ValidationMap,
  ValidationResult,
  ValueEditorType,
  ValueSourceFullOptions,
  ValueSources,
} from '../types';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';
import { lc } from './misc';
import {
  getFirstOption,
  getOption,
  isFlexibleOptionArray,
  isFlexibleOptionGroupArray,
  toFullOptionList,
} from './optGroupUtils';

/**
 * Functions used by {@link deriveRuleContext} to resolve a rule's configuration. Each corresponds
 * to the `QueryBuilder` prop (or `useQueryBuilderSetup` output) of the same name.
 */
export interface RuleContextResolvers<F extends FullField = FullField> {
  fields: OptionList<F>;
  fieldMap: Partial<FullOptionRecord<FullField>>;
  getInputType: (field: string, operator: string, misc: { fieldData: F }) => InputType | null;
  getMatchModes: (field: string, misc: { fieldData: F }) => MatchModeOptions;
  getOperators: (field: string, misc: { fieldData: F }) => OptionList<FullOperator>;
  getParameters: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => FlexibleOptionList<Option>;
  getValueEditorType: (field: string, operator: string, misc: { fieldData: F }) => ValueEditorType;
  getValues: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => FlexibleOptionList<Option>;
  getValueSources: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => ValueSourceFullOptions;
  getSubQueryBuilderProps?: (field: string, misc: { fieldData: F }) => Record<string, unknown>;
}

/**
 * Everything {@link deriveRuleContext} resolves for a single rule.
 */
export interface RuleContext<F extends FullField = FullField> {
  fieldData: F;
  hideValueControls: boolean;
  inputType: InputType | null;
  matchModes: MatchModeOptions;
  operatorObject: FullOperator | undefined;
  operators: OptionList<FullOperator>;
  parameters: FlexibleOptionList<Option> | null;
  validationResult: boolean | ValidationResult;
  valueEditorType: ValueEditorType;
  values: FlexibleOptionList<Option>;
  valueSourceOptions: ValueSourceFullOptions;
  valueSources: ValueSources;
  subQueryBuilderProps: Record<string, unknown>;
}

/**
 * Resolves the field configuration for a rule's `field`, falling back to a minimal option object
 * when the field isn't present in the field map.
 */
export const getFieldData = (
  field: string,
  fieldMap: Partial<FullOptionRecord<FullField>>
): FullField => fieldMap?.[field] ?? { name: field, value: field, label: field };

/**
 * The input type for a rule. A field's own `inputType` takes precedence over `getInputType`.
 */
export const getRuleInputType = <F extends FullField = FullField>(
  field: string,
  operator: string,
  fieldData: F,
  getInputType: RuleContextResolvers<F>['getInputType']
): InputType | null => fieldData.inputType ?? getInputType(field, operator, { fieldData });

/**
 * Whether the value editor(s) should be hidden for an operator, based on its `arity`.
 */
export const hideValueControlsForOperator = (operatorObject?: FullOperator): boolean => {
  const arity = operatorObject?.arity;
  return (
    (typeof arity === 'string' && arity === 'unary') || (typeof arity === 'number' && arity < 2)
  );
};

/**
 * The subset of a rule that determines its configuration. Accepting only these properties (rather
 * than the whole rule) lets React callers keep granular memoization dependencies, so editing a
 * rule's `value` doesn't recompute its operators, value sources, or option lists.
 */
export type RuleFacet = Pick<RuleType, 'field' | 'operator' | 'valueSource'>;

/**
 * Value source options for a rule. A `valueSource` present on the rule but absent from the
 * configured list is appended, so the current selection is always representable.
 */
export const getRuleValueSourceOptions = <F extends FullField = FullField>(
  rule: RuleFacet,
  fieldData: F,
  getValueSources: RuleContextResolvers<F>['getValueSources']
): ValueSourceFullOptions => {
  const configuredVSs = getValueSources(rule.field, rule.operator, { fieldData });
  if (rule.valueSource && !getOption(configuredVSs, rule.valueSource)) {
    return [
      ...configuredVSs,
      { name: rule.valueSource, value: rule.valueSource, label: rule.valueSource },
    ] as ValueSourceFullOptions;
  }
  return configuredVSs;
};

/**
 * Normalizes the result of `getParameters` to a non-empty list or `null`.
 */
export const getParametersAsList = (
  parameters: FlexibleOptionList<Option>
): FlexibleOptionList<Option> | null => (parameters && parameters.length > 0 ? parameters : null);

/**
 * The value editor type for a rule. `valueSource: "field"` always uses a select list, and
 * `valueSource: "parameter"` uses a (multi)select when parameters are available.
 */
export const getRuleValueEditorType = <F extends FullField = FullField>(
  rule: RuleFacet,
  fieldData: F,
  parametersAsList: FlexibleOptionList<Option> | null,
  getValueEditorType: RuleContextResolvers<F>['getValueEditorType']
): ValueEditorType =>
  rule.valueSource === 'field'
    ? 'select'
    : rule.valueSource === 'parameter'
      ? parametersAsList
        ? lc(rule.operator) === 'in' || lc(rule.operator) === 'notin'
          ? 'multiselect'
          : 'select'
        : 'text'
      : getValueEditorType(rule.field, rule.operator, { fieldData });

/**
 * The option list presented by a rule's value editor, resolved from its `valueSource`.
 */
export const getRuleValues = <F extends FullField = FullField>(
  rule: RuleFacet,
  fieldData: F,
  fields: OptionList<F>,
  parametersAsList: FlexibleOptionList<Option> | null,
  getValues: RuleContextResolvers<F>['getValues']
): FlexibleOptionList<Option> => {
  const v =
    rule.valueSource === 'field'
      ? filterFieldsByComparator(fieldData, fields, rule.operator)
      : rule.valueSource === 'parameter'
        ? (parametersAsList ?? [])
        : getValues(rule.field, rule.operator, { fieldData });
  return isFlexibleOptionArray(v) || isFlexibleOptionGroupArray(v) ? toFullOptionList(v) : v;
};

/**
 * The validation result for a rule: the entry from a query-level {@link ValidationMap} if present,
 * otherwise the field's own `validator` result, otherwise `null`.
 */
export const getRuleValidationResult = (
  rule: RuleType,
  fieldData: FullField,
  validationMap: ValidationMap = {},
  id: string = rule.id ?? ''
): boolean | ValidationResult =>
  validationMap[id] ??
  (typeof fieldData.validator === 'function' ? fieldData.validator(rule) : null);

/**
 * Resolves everything about a single rule that depends on the field/operator configuration:
 * its field data, operators, value editor type, value list, value sources, match modes, and
 * validation result.
 *
 * This is the framework-agnostic core of the `useRule` hook, shared with
 * {@link QueryManager.getRuleContext} so that non-React implementations derive identical results.
 * It performs no memoization; callers are responsible for caching as appropriate.
 *
 * @group Query Tools
 */
export const deriveRuleContext = <F extends FullField = FullField>(
  rule: RuleType,
  resolvers: RuleContextResolvers<F>,
  options: { validationMap?: ValidationMap; id?: string } = {}
): RuleContext<F> => {
  const {
    fields,
    fieldMap,
    getInputType,
    getMatchModes,
    getOperators,
    getParameters,
    getValueEditorType,
    getValues,
    getValueSources,
    getSubQueryBuilderProps,
  } = resolvers;

  const fieldData = getFieldData(rule.field, fieldMap) as F;
  const inputType = fieldData.inputType ?? getInputType(rule.field, rule.operator, { fieldData });
  const matchModes = getMatchModes(rule.field, { fieldData });
  const operators = getOperators(rule.field, { fieldData });
  const operatorObject = getOption(operators, rule.operator);
  const valueSourceOptions = getRuleValueSourceOptions(rule, fieldData, getValueSources);
  const parameters = getParametersAsList(getParameters(rule.field, rule.operator, { fieldData }));

  return {
    fieldData,
    hideValueControls: hideValueControlsForOperator(operatorObject),
    inputType,
    matchModes,
    operatorObject,
    operators,
    parameters,
    validationResult: getRuleValidationResult(rule, fieldData, options.validationMap, options.id),
    valueEditorType: getRuleValueEditorType(rule, fieldData, parameters, getValueEditorType),
    values: getRuleValues(rule, fieldData, fields, parameters, getValues),
    valueSourceOptions,
    valueSources: valueSourceOptions.map(({ value }) => value) as ValueSources,
    subQueryBuilderProps: getSubQueryBuilderProps?.(rule.field, { fieldData }) ?? {},
  };
};

/**
 * Everything {@link deriveRuleGroupContext} resolves for a single rule group.
 */
export interface RuleGroupContext<C extends FullCombinator = FullCombinator> {
  combinator: string;
  combinatorObject: C | undefined;
  combinators: FullOptionList<C>;
  /** The `className` of the selected combinator, or `null` for independent combinators. */
  combinatorBasedClassName: Classname | null;
  independentCombinators: boolean;
  validationResult: boolean | ValidationResult;
}

/**
 * The effective combinator for a group: its own `combinator` when it has one, otherwise the
 * first configured combinator (which is the case for groups with independent combinators).
 *
 * This intentionally covers only the current property-based API. The `RuleGroup` component
 * additionally falls back to its deprecated `combinator` prop; that fallback stays in the hook.
 */
export const getRuleGroupCombinator = <C extends FullCombinator = FullCombinator>(
  ruleGroup: RuleGroupTypeAny,
  combinators: FullOptionList<C>
): string =>
  isRuleGroupType(ruleGroup) ? ruleGroup.combinator : (getFirstOption(combinators) ?? '');

/**
 * Resolves everything about a rule group that depends on the combinator configuration, plus its
 * validation result.
 *
 * Note that unlike {@link deriveRuleContext}, there is no field-level validator fallback—a
 * group's validation result comes only from the query-level {@link ValidationMap}.
 *
 * @group Query Tools
 */
export const deriveRuleGroupContext = <C extends FullCombinator = FullCombinator>(
  ruleGroup: RuleGroupTypeAny,
  combinators: FullOptionList<C>,
  options: { validationMap?: ValidationMap; id?: string } = {}
): RuleGroupContext<C> => {
  const independentCombinators = isRuleGroupTypeIC(ruleGroup);
  const combinator = getRuleGroupCombinator(ruleGroup, combinators);
  const combinatorObject = getOption(combinators, combinator);

  return {
    combinator,
    combinatorObject,
    combinators,
    combinatorBasedClassName: independentCombinators ? null : (combinatorObject?.className ?? ''),
    independentCombinators,
    validationResult: (options.validationMap ?? {})[options.id ?? ruleGroup.id ?? ''] ?? null,
  };
};
