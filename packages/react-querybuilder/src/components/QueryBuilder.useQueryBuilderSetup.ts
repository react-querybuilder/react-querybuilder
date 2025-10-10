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
  filterFieldsByComparator,
  generateID,
  getFirstOption,
  getMatchModesUtil,
  getOption,
  getValueSourcesUtil,
  isFlexibleOptionGroupArray,
  joinWith,
  prepareOptionList,
  toFullOptionList,
  uniqOptList,
} from '@react-querybuilder/core';
import { useCallback, useMemo, useState } from 'react';
import type { UseMergedContext } from '../hooks';
import { useFields, useMergedContext } from '../hooks';
import type { QueryBuilderProps } from '../types';

// oxlint-disable-next-line typescript/no-explicit-any
const getFirstOptionsFrom = (opts: any[], r: RuleType, listsAsArrays?: boolean) => {
  const firstOption = getFirstOption(opts);

  if (r.operator === 'between' || r.operator === 'notBetween') {
    const valueAsArray = [firstOption, firstOption];
    return listsAsArrays
      ? valueAsArray
      : joinWith(
          valueAsArray.map(v => v ?? /* istanbul ignore next */ ''),
          ','
        );
  }

  return firstOption;
};

export type UseQueryBuilderSetup<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = {
  qbId: string;
  rqbContext: UseMergedContext<F, GetOptionIdentifierType<O>, true>;
  fields: FullOptionList<F>;
  fieldMap: FullOptionMap<
    FullField<string, string, string, FullOption, FullOption>,
    GetOptionIdentifierType<F>
  >;
  combinators:
    | WithUnknownIndex<BaseOption & FullOption>[]
    | OptionGroup<WithUnknownIndex<BaseOption & FullOption>>[];
  getRuleDefaultValue: <RT extends RuleType = GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>>(
    r: RT
  ) => any; // oxlint-disable-line typescript/no-explicit-any
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

  const [qbId] = useState(generateID);

  const {
    fields: fieldsProp,
    baseField,
    operators: operatorsProp,
    baseOperator,
    combinators: combinatorsProp,
    baseCombinator,
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

  // #region `operators`
  const { optionList: operators, defaultOption: defaultOperator } = useMemo(
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
    (field: FieldName, { fieldData }: { fieldData: F }): FullOptionList<O> => {
      let opsFinal = operators as FullOptionList<O>;

      if (fieldData?.operators) {
        opsFinal = toFullOptionList(fieldData.operators, baseOperator, defaultOperatorLabelMap);
      } else if (getOperators) {
        const ops = getOperators(field, { fieldData });
        if (ops) {
          opsFinal = toFullOptionList(ops, baseOperator, defaultOperatorLabelMap);
        }
      }

      if (!autoSelectOperator) {
        opsFinal = (
          isFlexibleOptionGroupArray(opsFinal)
            ? [
                { label: translations.operators.placeholderGroupLabel, options: [defaultOperator] },
                ...opsFinal,
              ]
            : [defaultOperator, ...opsFinal]
        ) as FullOptionList<O>;
      }

      return uniqOptList(opsFinal) as FullOptionList<O>;
    },
    [
      autoSelectOperator,
      baseOperator,
      defaultOperator,
      getOperators,
      operators,
      translations.operators.placeholderGroupLabel,
    ]
  );

  const getRuleDefaultOperator = useCallback(
    (field: FieldName): OperatorName => {
      const fieldData = fieldMap[field] as F;

      if (fieldData?.defaultOperator) {
        return fieldData.defaultOperator as OperatorName;
      }

      if (getDefaultOperator) {
        return typeof getDefaultOperator === 'function'
          ? (getDefaultOperator(field, { fieldData }) as OperatorName)
          : getDefaultOperator;
      }

      const ops = getOperatorsMain(field, { fieldData }) ?? /* istanbul ignore next */ [];
      return (getFirstOption(ops) ?? /* istanbul ignore next */ '') as OperatorName;
    },
    [fieldMap, getDefaultOperator, getOperatorsMain]
  );
  // #endregion

  // #region Rule property getters
  const getValueEditorTypeMain = useCallback(
    (field: FieldName, operator: OperatorName, { fieldData }: { fieldData: F }) => {
      if (fieldData.valueEditorType) {
        if (typeof fieldData.valueEditorType === 'function') {
          return fieldData.valueEditorType(operator);
        }
        return fieldData.valueEditorType;
      }

      return getValueEditorType?.(field, operator, { fieldData }) ?? 'text';
    },
    [getValueEditorType]
  );

  const getValueSourcesMain = useCallback(
    (field: FieldName, operator: OperatorName, _misc?: { fieldData: F }) =>
      getValueSourcesUtil<F, OperatorName>(fieldMap[field] as F, operator, getValueSources),
    [fieldMap, getValueSources]
  );

  const getMatchModesMain = useCallback(
    (field: FieldName, _misc?: { fieldData: F }) =>
      getMatchModesUtil<F>(fieldMap[field] as F, getMatchModes),
    [fieldMap, getMatchModes]
  );

  const getSubQueryBuilderPropsMain = useCallback(
    (field: FieldName, misc: { fieldData: F }): Record<string, unknown> =>
      // oxlint-disable-next-line typescript/no-explicit-any
      getSubQueryBuilderProps?.(field, misc) ?? ({} as any),
    [getSubQueryBuilderProps]
  );

  const defaultValueOption = useMemo(
    (): FullOption<OperatorName> => ({
      id: translations.values.placeholderName,
      name: translations.values.placeholderName as OperatorName,
      value: translations.values.placeholderName as OperatorName,
      label: translations.values.placeholderLabel,
    }),
    [translations.values.placeholderLabel, translations.values.placeholderName]
  );

  const getValuesMain = useCallback(
    (field: FieldName, operator: OperatorName, { fieldData }: { fieldData: F }) => {
      let valsFinal: FullOptionList<BaseOption> = [];
      if (fieldData?.values) {
        valsFinal = toFullOptionList(fieldData.values);
      }
      if (getValues) {
        valsFinal = toFullOptionList(getValues(field, operator, { fieldData }));
      }

      if (!autoSelectValue) {
        valsFinal = isFlexibleOptionGroupArray(valsFinal)
          ? [
              {
                label: translations.values.placeholderGroupLabel,
                options: [defaultValueOption],
              },
              ...valsFinal,
            ]
          : [defaultValueOption, ...valsFinal];
      }
      return valsFinal;
    },
    [autoSelectValue, defaultValueOption, getValues, translations.values.placeholderGroupLabel]
  );

  const getRuleDefaultValue = useCallback(
    <RT extends RuleType = R>(r: RT) => {
      const fieldData = (fieldMap[r.field as FieldName] ?? {}) as F;
      if (fieldData?.defaultValue !== undefined && fieldData.defaultValue !== null) {
        return fieldData.defaultValue;
      } else if (getDefaultValue) {
        return getDefaultValue(r, { fieldData });
      }

      let value: string | (string | null)[] | boolean | null = '';

      const values = getValuesMain(r.field as FieldName, r.operator as OperatorName, {
        fieldData,
      });

      if (r.valueSource === 'field') {
        const filteredFields = filterFieldsByComparator(fieldData, fields, r.operator);
        value =
          filteredFields.length > 0 ? getFirstOptionsFrom(filteredFields, r, listsAsArrays) : '';
      } else if (values.length > 0) {
        const editorType = getValueEditorTypeMain(
          r.field as FieldName,
          r.operator as OperatorName,
          { fieldData }
        );
        if (editorType === 'multiselect') {
          value = listsAsArrays ? [] : '';
        } else if (editorType === 'select' || editorType === 'radio') {
          value = getFirstOptionsFrom(values, r, listsAsArrays);
        }
      } else {
        const editorType = getValueEditorTypeMain(
          r.field as FieldName,
          r.operator as OperatorName,
          { fieldData }
        );
        if (editorType === 'checkbox') {
          value = false;
        }
      }

      return value;
    },
    [fieldMap, fields, getDefaultValue, getValueEditorTypeMain, getValuesMain, listsAsArrays]
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
  const createRule = useCallback((): R => {
    let field = '' as FieldName;
    const flds = fields as FullOptionList<F>;
    /* istanbul ignore else */
    if (flds?.length > 0 && flds[0]) {
      const fo = getFirstOption(flds) as FieldName;
      /* istanbul ignore else */
      if (fo) field = fo;
    }
    if (getDefaultField) {
      if (typeof getDefaultField === 'function') {
        const df = getDefaultField(flds) as FieldName;
        /* istanbul ignore else */
        if (df) field = df;
      } else {
        field = getDefaultField;
      }
    }

    const operator = getRuleDefaultOperator(field);

    const valueSource =
      getFirstOption(
        getValueSourcesMain(field, operator, { fieldData: getOption(flds, field) as F })
      ) ?? 'value';

    const matchMode = getFirstOption(
      getMatchModesMain(field, { fieldData: getOption(flds, field) as F })
    );

    const newRule = {
      id: idGenerator(),
      field,
      operator,
      valueSource,
      value: '',
      ...(matchMode ? { match: { mode: matchMode, threshold: 1 } } : null),
    } as unknown as R;

    const value = getRuleDefaultValue(newRule);

    return { ...newRule, value };
  }, [
    fields,
    getDefaultField,
    getMatchModesMain,
    getRuleDefaultOperator,
    getRuleDefaultValue,
    getValueSourcesMain,
    idGenerator,
  ]);

  const createRuleGroup = useCallback(
    (independentCombinators?: boolean): RG => {
      if (independentCombinators) {
        return {
          id: idGenerator(),
          rules: addRuleToNewGroups ? [createRule() as RuleType] : [],
          not: false,
        } as RG;
      }
      // TODO: Avoid `@ts-expect-error`
      // @ts-expect-error TS can't tell that RG is necessarily RuleGroupType
      return {
        id: idGenerator(),
        rules: addRuleToNewGroups ? [createRule()] : [],
        combinator: getFirstOption(combinators) ?? /* istanbul ignore next */ '',
        not: false,
      };
    },
    [addRuleToNewGroups, combinators, createRule, idGenerator]
  );
  // #endregion

  return {
    qbId,
    rqbContext,
    // TODO: Why is a cast necessary here?
    fields: fields as FullOptionList<F>,
    fieldMap,
    combinators,
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
