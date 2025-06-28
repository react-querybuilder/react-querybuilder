import { useMemo } from 'react';
import type {
  FlexibleOptionList,
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionList,
  FullOptionMap,
  FullOptionRecord,
  GetOptionIdentifierType,
  OptionGroup,
  QueryBuilderProps,
  RuleGroupTypeAny,
  TranslationsFull,
} from '../types';
import {
  isFlexibleOptionGroupArray,
  objectKeys,
  toFullOption,
  toFullOptionList,
  toFullOptionMap,
  uniqByIdentifier,
  uniqOptGroups,
} from '../utils';

export interface UseFields<F extends FullField> {
  defaultField: FullField;
  fields: F[] | OptionGroup<F>[];
  fieldMap: Partial<FullOptionRecord<FullField>>;
}

export const useFields = <F extends FullField>(
  props: { translations: TranslationsFull } & Pick<
    QueryBuilderProps<RuleGroupTypeAny, F, FullOperator, FullCombinator>,
    'fields' | 'baseField' | 'autoSelectField'
  >
): UseFields<F> => {
  type FieldName = GetOptionIdentifierType<F>;

  const { fields: fieldsPropOriginal, baseField, translations, autoSelectField } = props;

  const defaultField = useMemo(
    () =>
      ({
        id: translations.fields.placeholderName,
        name: translations.fields.placeholderName,
        value: translations.fields.placeholderName,
        label: translations.fields.placeholderLabel,
      }) as FullField,
    [translations.fields.placeholderLabel, translations.fields.placeholderName]
  );
  const fieldsProp = useMemo(
    () => fieldsPropOriginal ?? ([defaultField] as FlexibleOptionList<F>),
    [defaultField, fieldsPropOriginal]
  );

  const fields = useMemo((): F[] | OptionGroup<F>[] => {
    const flds = (
      Array.isArray(fieldsProp)
        ? toFullOptionList(fieldsProp, baseField)
        : (objectKeys(toFullOptionMap(fieldsProp, baseField)) as unknown as FieldName[])
            .map(fld => ({ ...fieldsProp[fld], name: fld, value: fld }))
            .sort((a, b) => a.label.localeCompare(b.label))
    ) as FullOptionList<F>;
    if (isFlexibleOptionGroupArray(flds)) {
      return autoSelectField
        ? (uniqOptGroups(flds) as FullOptionList<F>)
        : (uniqOptGroups([
            {
              label: translations.fields.placeholderGroupLabel,
              options: [defaultField],
            },
            ...flds,
          ]) as FullOptionList<F>);
    } else {
      return autoSelectField
        ? (uniqByIdentifier(flds as F[]) as FullOptionList<F>)
        : (uniqByIdentifier([defaultField, ...(flds as F[])]) as FullOptionList<F>);
    }
  }, [
    autoSelectField,
    baseField,
    defaultField,
    fieldsProp,
    translations.fields.placeholderGroupLabel,
  ]);

  const fieldMap = useMemo(() => {
    if (!Array.isArray(fieldsProp)) {
      const fp = toFullOptionMap(fieldsProp, baseField) as FullOptionMap<FullField, FieldName>;
      return autoSelectField ? fp : { ...fp, [translations.fields.placeholderName]: defaultField };
    }
    const fm: Partial<FullOptionRecord<FullField>> = {};
    if (isFlexibleOptionGroupArray(fields)) {
      for (const f of fields) {
        for (const opt of f.options) {
          fm[(opt.value ?? /* istanbul ignore next */ opt.name) as FieldName] = toFullOption(
            opt,
            baseField
          ) as FullField;
        }
      }
    } else {
      for (const f of fields) {
        fm[(f.value ?? /* istanbul ignore next */ f.name) as FieldName] = toFullOption(
          f,
          baseField
        ) as FullField;
      }
    }
    return fm;
  }, [
    autoSelectField,
    baseField,
    defaultField,
    fields,
    fieldsProp,
    translations.fields.placeholderName,
  ]);

  return {
    defaultField,
    fields,
    fieldMap,
  };
};
