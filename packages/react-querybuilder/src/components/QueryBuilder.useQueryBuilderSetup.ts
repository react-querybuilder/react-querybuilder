import type {
  BaseOption,
  FlexibleOptionList,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  FullOptionList,
  FullOptionMap,
  GetOptionIdentifierType,
  GetRuleTypeFromGroupWithFieldAndOperator,
  MatchModeOptions,
  Option,
  OptionGroup,
  RemoveNullability,
  RuleGroupTypeAny,
  RuleType,
  ValueSourceFullOptions,
  WithUnknownIndex,
} from '@react-querybuilder/core';
import {
  defaultCombinatorLabelMap,
  defaultCombinators,
  defaultOperatorLabelMap,
  defaultOperators,
  generateID,
  getMatchModesUtil,
  getRuleDefaultValue as getRuleDefaultValueCore,
  getValueSourcesUtil,
  createRule as createRuleCore,
  createRuleGroup as createRuleGroupCore,
  prepareOptionList,
  resolveDefaultOperator,
  resolveOperatorList,
  resolveValueEditorType,
  resolveValueList,
} from '@react-querybuilder/core';
import { useCallback, useMemo, useState } from 'react';
import type { UseMergedContext } from '../hooks';
import { useFields, useMergedContext, useQbId } from '../hooks';
import type { QueryBuilderProps } from '../types';

export type UseQueryBuilderSetup<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = {
  qbId: string;
  resolveQbIdCollision: () => void;
  rqbContext: UseMergedContext<F, GetOptionIdentifierType<O>, true>;
  fields: FullOptionList<F>;
  fieldMap: FullOptionMap<
    FullField<string, string, string, FullOption, FullOption>,
    GetOptionIdentifierType<F>
  >;
  combinators:
    | WithUnknownIndex<BaseOption & FullOption>[]
    | OptionGroup<WithUnknownIndex<BaseOption & FullOption>>[];
  getParameters(
    field?: GetOptionIdentifierType<F>,
    operator?: GetOptionIdentifierType<O>,
    meta?: { fieldData: F }
  ): FullOptionList<FullOption>;
  getRuleDefaultValue: // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
  <RT extends RuleType = GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>>(r: RT) => any; // oxlint-disable-line typescript/no-explicit-any
  createRule: () => GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>;
  createRuleGroup: (independentCombinators?: boolean) => RG;
} & RemoveNullability<{
  getInputTypeMain: QueryBuilderProps<RG, F, O, C>['getInputType'];
  getRuleDefaultOperator: QueryBuilderProps<RG, F, O, C>['getDefaultOperator'];
  getValueEditorTypeMain: QueryBuilderProps<RG, F, O, C>['getValueEditorType'];
}> & {
    getValueSourcesMain: (
      field: GetOptionIdentifierType<F>,
      operator: GetOptionIdentifierType<O>,
      misc: { fieldData: F }
    ) => ValueSourceFullOptions;
    getSubQueryBuilderPropsMain: (
      field: GetOptionIdentifierType<F>,
      misc: { fieldData: F }
    ) => Record<string, unknown>;
    getMatchModesMain: (
      field: GetOptionIdentifierType<F>,
      misc?: { fieldData: F }
    ) => MatchModeOptions;
    getOperatorsMain: (
      ...p: Parameters<NonNullable<QueryBuilderProps<RG, F, O, C>['getOperators']>>
    ) => FullOptionList<O>;
    getValuesMain: (
      ...p: Parameters<NonNullable<QueryBuilderProps<RG, F, O, C>['getValues']>>
    ) => FullOptionList<Option>;
  };

/**
 * The core resolvers are identifier-agnostic (plain `string`), while these props use branded
 * identifier types. These aliases name the resolver-side signatures for the casts below.
 */
type ResolveOperators<F extends FullField, O extends FullOperator> = NonNullable<
  Parameters<typeof resolveOperatorList<F, O>>[0]['getOperators']
>;
type ResolveDefaultOperator<F extends FullField> = Parameters<
  typeof resolveDefaultOperator<F>
>[0]['getDefaultOperator'];
type ResolveValueEditorType<F extends FullField> = Parameters<
  typeof resolveValueEditorType<F>
>[0]['getValueEditorType'];
type ResolveValues<F extends FullField> = Parameters<typeof resolveValueList<F>>[0]['getValues'];

/**
 * Massages the props as necessary and prepares the basic update/generate methods
 * for use by the {@link QueryBuilder} component.
 *
 * @group Hooks
 */
export const useQueryBuilderSetup = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>
): UseQueryBuilderSetup<RG, F, O, C> => {
  type R = GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>;
  type FieldName = GetOptionIdentifierType<F>;
  type OperatorName = GetOptionIdentifierType<O>;

  const { qbId, resolveQbIdCollision } = useQbId(props.qbId);

  const {
    fields: fieldsProp,
    baseField,
    operators: operatorsProp,
    baseOperator,
    combinators: combinatorsProp,
    baseCombinator,
    getParameters: getParametersProp,
    translations: translationsProp,
    enableMountQueryChange: enableMountQueryChangeProp = true,
    controlClassnames: controlClassnamesProp,
    controlElements: controlElementsProp,
    getDefaultField,
    getDefaultOperator,
    getDefaultValue,
    getMatchModes,
    getOperators,
    getSubQueryBuilderProps,
    getValueEditorType,
    getValueSources,
    getInputType,
    getValues,
    autoSelectField = true,
    autoSelectOperator = true,
    autoSelectValue = true,
    addRuleToNewGroups = false,
    enableDragAndDrop: enableDragAndDropProp,
    showUndoRedo: showUndoRedoProp,
    listsAsArrays = false,
    debugMode: debugModeProp = false,
    idGenerator = generateID,
  } = props;

  const [initialQueryProp] = useState(props.query ?? props.defaultQuery);

  const rqbContext = useMergedContext({
    controlClassnames: controlClassnamesProp,
    controlElements: controlElementsProp,
    debugMode: debugModeProp,
    enableDragAndDrop: enableDragAndDropProp,
    enableMountQueryChange: enableMountQueryChangeProp,
    showUndoRedo: showUndoRedoProp,
    translations: translationsProp,
    initialQuery: initialQueryProp,
    qbId: qbId,
    finalize: true,
  });

  const { translations } = rqbContext;

  // #region `fields`
  const { fields, fieldMap } = useFields({
    fields: fieldsProp,
    baseField,
    autoSelectField,
    translations,
  });
  // #endregion

  // #region `combinators`
  const { optionList: combinators } = useMemo(
    () =>
      prepareOptionList({
        optionList: combinatorsProp ?? (defaultCombinators as FlexibleOptionList<C>),
        labelMap: defaultCombinatorLabelMap,
        baseOption: baseCombinator,
        autoSelectOption: true,
      }),
    [baseCombinator, combinatorsProp]
  );
  // #endregion

  // #region `getParameters`
  const getParametersMain = useCallback(
    (field?: FieldName, operator?: OperatorName, misc?: { fieldData: F }) =>
      prepareOptionList({
        optionList: getParametersProp?.(field, operator, misc) ?? [],
        autoSelectOption: true,
      }).optionList,
    [getParametersProp]
  );
  // #endregion

  // #region `operators`
  const { optionList: operators } = useMemo(
    () =>
      prepareOptionList({
        optionList: operatorsProp ?? (defaultOperators as FlexibleOptionList<O>),
        placeholder: translations.operators,
        labelMap: defaultOperatorLabelMap,
        baseOption: baseOperator,
        autoSelectOption: autoSelectOperator,
      }),
    [autoSelectOperator, baseOperator, operatorsProp, translations.operators]
  );

  const getOperatorsMain = useCallback(
    (field: FieldName, { fieldData }: { fieldData: F }) =>
      resolveOperatorList<F, O>({
        field,
        fieldData,
        // The props use branded identifier types; the resolvers are identifier-agnostic.
        getOperators: getOperators as ResolveOperators<F, O>,
        operators,
        placeholder: translations.operators,
        baseOption: baseOperator,
        autoSelectOption: autoSelectOperator,
      }),
    [autoSelectOperator, baseOperator, getOperators, operators, translations.operators]
  );

  const getRuleDefaultOperator = useCallback(
    (field: FieldName): OperatorName =>
      resolveDefaultOperator<F>({
        field,
        fieldData: fieldMap[field] as F,
        getDefaultOperator: getDefaultOperator as ResolveDefaultOperator<F>,
        getOperators: (f: string, misc: { fieldData: F }) => getOperatorsMain(f as FieldName, misc),
      }) as OperatorName,
    [fieldMap, getDefaultOperator, getOperatorsMain]
  );
  // #endregion

  // #region Rule property getters
  const getValueEditorTypeMain = useCallback(
    (field: FieldName, operator: OperatorName, { fieldData }: { fieldData: F }) =>
      resolveValueEditorType<F>({
        field,
        operator,
        fieldData,
        getValueEditorType: getValueEditorType as ResolveValueEditorType<F>,
      }),
    [getValueEditorType]
  );

  const getValueSourcesMain = useCallback(
    (field: FieldName, operator: OperatorName, _misc?: { fieldData: F }) =>
      getValueSourcesUtil(fieldMap[field] as F, operator, getValueSources),
    [fieldMap, getValueSources]
  );

  const getMatchModesMain = useCallback(
    (field: FieldName, _misc?: { fieldData: F }) =>
      getMatchModesUtil(fieldMap[field] as F, getMatchModes),
    [fieldMap, getMatchModes]
  );

  const getSubQueryBuilderPropsMain = useCallback(
    (field: FieldName, misc: { fieldData: F }): Record<string, unknown> =>
      // oxlint-disable-next-line typescript/no-explicit-any
      getSubQueryBuilderProps?.(field, misc) ?? ({} as any),
    [getSubQueryBuilderProps]
  );

  const getValuesMain = useCallback(
    (field: FieldName, operator: OperatorName, { fieldData }: { fieldData: F }) =>
      resolveValueList<F>({
        field,
        operator,
        fieldData,
        getValues: getValues as ResolveValues<F>,
        placeholder: translations.values,
        autoSelectOption: autoSelectValue,
      }),
    [autoSelectValue, getValues, translations.values]
  );

  const getRuleDefaultValue = useCallback(
    // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
    <RT extends RuleType = R>(r: RT) =>
      getRuleDefaultValueCore<F>(r, {
        fieldData: (fieldMap[r.field as FieldName] ?? {}) as F,
        fields,
        getParameters: (f, o, m) => getParametersMain(f as FieldName, o as OperatorName, m),
        listsAsArrays,
        getValueEditorType: (f, o, m) =>
          getValueEditorTypeMain(f as FieldName, o as OperatorName, m),
        getValues: (f, o, m) => getValuesMain(f as FieldName, o as OperatorName, m),
        getDefaultValue: getDefaultValue && ((rule, m) => getDefaultValue(rule as R, m)),
      }),
    [
      fieldMap,
      fields,
      getDefaultValue,
      getValueEditorTypeMain,
      getValuesMain,
      listsAsArrays,
      getParametersMain,
    ]
  );

  const getInputTypeMain = useCallback(
    (field: FieldName, operator: OperatorName, { fieldData }: { fieldData: F }) => {
      if (getInputType) {
        const inputType = getInputType(field, operator, { fieldData });
        if (inputType) return inputType;
      }

      return 'text';
    },
    [getInputType]
  );
  // #endregion

  // #region Rule/group creators
  const createRule = useCallback(
    (): R =>
      createRuleCore<F>({
        fields,
        getDefaultField,
        getRuleDefaultOperator: f => getRuleDefaultOperator(f as FieldName),
        getValueSources: (f, o, misc) =>
          getValueSourcesMain(f as FieldName, o as OperatorName, misc),
        getMatchModes: (f, misc) => getMatchModesMain(f as FieldName, misc),
        getRuleDefaultValue: r => getRuleDefaultValue(r as R),
        idGenerator,
      }) as R,
    [
      fields,
      getDefaultField,
      getMatchModesMain,
      getRuleDefaultOperator,
      getRuleDefaultValue,
      getValueSourcesMain,
      idGenerator,
    ]
  );

  const createRuleGroup = useCallback(
    (independentCombinators?: boolean): RG =>
      createRuleGroupCore<C>(
        { combinators, addRuleToNewGroups, createRule, idGenerator },
        independentCombinators
      ) as RG,
    [addRuleToNewGroups, combinators, createRule, idGenerator]
  );

  // #endregion

  return {
    qbId,
    resolveQbIdCollision,
    rqbContext,
    fields,
    fieldMap,
    combinators,
    getParameters: getParametersMain,
    getMatchModesMain,
    getOperatorsMain,
    getRuleDefaultOperator,
    getSubQueryBuilderPropsMain,
    getValueEditorTypeMain,
    getValueSourcesMain,
    getValuesMain,
    getRuleDefaultValue,
    getInputTypeMain,
    createRule,
    createRuleGroup,
  };
};
