import { useCallback, useMemo, useRef } from 'react';
import { defaultCombinators, defaultOperators } from '../defaults';
import { useControlledOrUncontrolled, useMergedContext } from '../hooks';
import type {
  Field,
  FullOption,
  QueryBuilderProps,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
  ToFullOption,
} from '../types';
import {
  filterFieldsByComparator,
  generateID,
  getFirstOption,
  getValueSourcesUtil,
  isOptionGroupArray,
  joinWith,
  objectKeys,
  toFullOption,
  toFullOptionList,
  uniqByName,
  uniqOptGroups,
} from '../utils';

/**
 * Massages the props as necessary and prepares the basic update/generate methods
 * for use by the {@link QueryBuilder} component.
 */
export const useQueryBuilderSetup = <RG extends RuleGroupType | RuleGroupTypeIC>(
  props: QueryBuilderProps<RG>
) => {
  const qbId = useRef(generateID());
  const firstRender = useRef(true);

  const {
    query: queryProp,
    defaultQuery,
    fields: fieldsPropOriginal,
    operators = defaultOperators,
    combinators: combinatorsProp = defaultCombinators,
    translations: translationsProp,
    enableMountQueryChange: enableMountQueryChangeProp = true,
    controlClassnames: controlClassnamesProp,
    controlElements: controlElementsProp,
    getDefaultField,
    getDefaultOperator,
    getDefaultValue,
    getOperators,
    getValueEditorType,
    getValueSources,
    getInputType,
    getValues,
    autoSelectField = true,
    autoSelectOperator = true,
    addRuleToNewGroups = false,
    enableDragAndDrop: enableDragAndDropProp,
    independentCombinators,
    listsAsArrays = false,
    debugMode: debugModeProp = false,
    idGenerator = generateID,
  } = props as QueryBuilderProps<RG>;

  const rqbContext = useMergedContext({
    controlClassnames: controlClassnamesProp,
    controlElements: controlElementsProp,
    debugMode: debugModeProp,
    enableDragAndDrop: enableDragAndDropProp,
    enableMountQueryChange: enableMountQueryChangeProp,
    translations: translationsProp,
  });

  const { translations } = rqbContext;

  // #region Set up `fields`
  const defaultField = useMemo(
    (): ToFullOption<Field> => ({
      id: translations.fields.placeholderName,
      name: translations.fields.placeholderName,
      value: translations.fields.placeholderName,
      label: translations.fields.placeholderLabel,
    }),
    [translations.fields.placeholderLabel, translations.fields.placeholderName]
  );
  const fieldsProp = useMemo(
    () => fieldsPropOriginal ?? [defaultField],
    [defaultField, fieldsPropOriginal]
  );

  const fields = useMemo(() => {
    const f = Array.isArray(fieldsProp)
      ? toFullOptionList(fieldsProp)
      : objectKeys(fieldsProp)
          .map((fld): ToFullOption<Field> => toFullOption({ ...fieldsProp[fld], name: fld }))
          .sort((a, b) => a.label.localeCompare(b.label));
    if (isOptionGroupArray(f)) {
      if (autoSelectField) {
        return uniqOptGroups(f);
      } else {
        return uniqOptGroups([
          {
            label: translations.fields.placeholderGroupLabel,
            options: [defaultField],
          },
          ...f,
        ]);
      }
    } else {
      if (autoSelectField) {
        return uniqByName(f);
      } else {
        return uniqByName([defaultField, ...f]);
      }
    }
  }, [autoSelectField, defaultField, fieldsProp, translations.fields.placeholderGroupLabel]);

  const fieldMap = useMemo(() => {
    if (!Array.isArray(fieldsProp)) {
      const fp: Record<string, ToFullOption<Field>> = {};
      objectKeys(fieldsProp).forEach(f => {
        fp[f] = toFullOption({ ...fieldsProp[f], name: f });
      });
      if (autoSelectField) {
        return fp;
      } else {
        return { ...fp, [translations.fields.placeholderName]: defaultField };
      }
    }
    const fm: Record<string, ToFullOption<Field>> = {};
    if (isOptionGroupArray(fields)) {
      fields.forEach(f =>
        f.options.forEach(opt => {
          fm[opt.name] = toFullOption(opt);
        })
      );
    } else {
      fields.forEach(f => {
        fm[f.name] = toFullOption(f);
      });
    }
    return fm;
  }, [autoSelectField, defaultField, fields, fieldsProp, translations.fields.placeholderName]);
  // #endregion

  const combinators = useMemo(() => toFullOptionList(combinatorsProp), [combinatorsProp]);

  // #region Set up `operators`
  const defaultOperator = useMemo(
    (): FullOption => ({
      id: translations.operators.placeholderName,
      name: translations.operators.placeholderName,
      value: translations.operators.placeholderName,
      label: translations.operators.placeholderLabel,
    }),
    [translations.operators.placeholderLabel, translations.operators.placeholderName]
  );

  const getOperatorsMain = useCallback(
    (field: string, { fieldData }: { fieldData: ToFullOption<Field> }) => {
      let opsFinal = toFullOptionList(operators);

      if (fieldData?.operators) {
        opsFinal = toFullOptionList(fieldData.operators);
      } else if (getOperators) {
        const ops = getOperators(field, { fieldData });
        if (ops) {
          opsFinal = toFullOptionList(ops);
        }
      }

      if (!autoSelectOperator) {
        if (isOptionGroupArray(opsFinal)) {
          opsFinal = [
            {
              label: translations.operators.placeholderGroupLabel,
              options: [defaultOperator],
            },
            ...opsFinal,
          ];
        } else {
          opsFinal = [defaultOperator, ...opsFinal];
        }
      }

      return isOptionGroupArray(opsFinal) ? uniqOptGroups(opsFinal) : uniqByName(opsFinal);
    },
    [
      autoSelectOperator,
      defaultOperator,
      getOperators,
      operators,
      translations.operators.placeholderGroupLabel,
    ]
  );

  const getRuleDefaultOperator = useCallback(
    (field: string) => {
      const fieldData = fieldMap[field];
      if (fieldData?.defaultOperator) {
        return fieldData.defaultOperator;
      }

      if (getDefaultOperator) {
        if (typeof getDefaultOperator === 'function') {
          return getDefaultOperator(field, { fieldData });
        } else {
          return getDefaultOperator;
        }
      }

      const ops = getOperatorsMain(field, { fieldData }) ?? /* istanbul ignore next */ [];
      return ops.length
        ? getFirstOption(ops) ?? /* istanbul ignore next */ ''
        : /* istanbul ignore next */ '';
    },
    [fieldMap, getDefaultOperator, getOperatorsMain]
  );
  // #endregion

  // #region Rule property getters
  const getValueEditorTypeMain = useCallback(
    (field: string, operator: string, { fieldData }: { fieldData: ToFullOption<Field> }) => {
      if (getValueEditorType) {
        const vet = getValueEditorType(field, operator, { fieldData });
        if (vet) return vet;
      }

      return 'text';
    },
    [getValueEditorType]
  );

  const getValueSourcesMain = useCallback(
    (field: string, operator: string) =>
      getValueSourcesUtil(fieldMap[field], operator, getValueSources),
    [fieldMap, getValueSources]
  );

  const getValuesMain = useCallback(
    (field: string, operator: string, { fieldData }: { fieldData: ToFullOption<Field> }) => {
      // Ignore this in tests because Rule already checks for
      // the presence of the values property in fieldData.
      /* istanbul ignore if */
      if (fieldData?.values) {
        return toFullOptionList(fieldData.values);
      }
      if (getValues) {
        return toFullOptionList(getValues(field, operator, { fieldData }));
      }

      return [];
    },
    [getValues]
  );

  const getRuleDefaultValue = useCallback(
    (rule: RuleType) => {
      const fieldData = fieldMap[rule.field];
      if (fieldData?.defaultValue !== undefined && fieldData.defaultValue !== null) {
        return fieldData.defaultValue;
      } else if (getDefaultValue) {
        return getDefaultValue(rule, { fieldData });
      }

      let value: any = '';

      const values = getValuesMain(rule.field, rule.operator, { fieldData });

      const getFirstOptionsFrom = (opts: any[]) => {
        const firstOption = getFirstOption(opts);
        if (rule.operator === 'between' || rule.operator === 'notBetween') {
          const valueAsArray = [firstOption, firstOption];
          return listsAsArrays
            ? valueAsArray
            : joinWith(
                valueAsArray.map(v => v ?? /* istanbul ignore next */ ''),
                ','
              );
        } else {
          return firstOption;
        }
      };

      if (rule.valueSource === 'field') {
        const filteredFields = filterFieldsByComparator(fieldData, fields, rule.operator);
        if (filteredFields.length > 0) {
          value = getFirstOptionsFrom(filteredFields);
        } else {
          value = '';
        }
      } else if (values.length) {
        value = getFirstOptionsFrom(values);
      } else {
        const editorType = getValueEditorTypeMain(rule.field, rule.operator, { fieldData });
        if (editorType === 'checkbox') {
          value = false;
        }
      }

      return value;
    },
    [fieldMap, fields, getDefaultValue, getValueEditorTypeMain, getValuesMain, listsAsArrays]
  );

  const getInputTypeMain = useCallback(
    (field: string, operator: string, { fieldData }: { fieldData: ToFullOption<Field> }) => {
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
  const createRule = useCallback((): RuleType => {
    let field = '';
    /* istanbul ignore else */
    if (fields?.length > 0 && fields[0]) {
      field = getFirstOption(fields) ?? /* istanbul ignore next */ '';
    }
    if (getDefaultField) {
      if (typeof getDefaultField === 'function') {
        field = getDefaultField(fields);
      } else {
        field = getDefaultField;
      }
    }

    const operator = getRuleDefaultOperator(field);

    const valueSource = getValueSourcesMain(field, operator)[0] ?? 'value';

    const newRule: RuleType = {
      id: idGenerator(),
      field,
      operator,
      valueSource,
      value: '',
    };

    const value = getRuleDefaultValue(newRule);

    return { ...newRule, value };
  }, [
    fields,
    getDefaultField,
    getRuleDefaultOperator,
    getRuleDefaultValue,
    getValueSourcesMain,
    idGenerator,
  ]);

  const createRuleGroup = useCallback((): RG => {
    // TODO: figure out how to avoid `@ts-expect-error` here
    if (independentCombinators) {
      // @ts-expect-error TS can't tell that RG means RuleGroupTypeIC
      return {
        id: idGenerator(),
        rules: addRuleToNewGroups ? [createRule()] : [],
        not: false,
      };
    }
    // @ts-expect-error TS can't tell that RG means RuleGroupType
    return {
      id: idGenerator(),
      rules: addRuleToNewGroups ? [createRule()] : [],
      combinator: getFirstOption(combinators) ?? /* istanbul ignore next */ '',
      not: false,
    };
  }, [addRuleToNewGroups, combinators, createRule, idGenerator, independentCombinators]);
  // #endregion

  useControlledOrUncontrolled({
    defaultQuery,
    queryProp,
    isFirstRender: firstRender.current,
  });

  if (firstRender.current) {
    firstRender.current = false;
  }

  return {
    qbId: qbId.current,
    rqbContext,
    fields,
    fieldMap,
    combinators,
    getOperatorsMain,
    getRuleDefaultOperator,
    getValueEditorTypeMain,
    getValueSourcesMain,
    getValuesMain,
    getRuleDefaultValue,
    getInputTypeMain,
    createRule,
    createRuleGroup,
  };
};
