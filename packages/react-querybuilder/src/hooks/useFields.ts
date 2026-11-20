import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionList,
  FullOptionRecord,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { inferFieldListDefaults, prepareOptionList } from '@react-querybuilder/core';
import { useMemo } from 'react';
import type { QueryBuilderProps, TranslationsFull } from '../types';

export interface UseFields<F extends FullField> {
  defaultField: FullField;
  fields: FullOptionList<F>;
  fieldMap: Partial<FullOptionRecord<FullField>>;
}

export const useFields = <F extends FullField>(
  props: { translations: TranslationsFull } & Pick<
    QueryBuilderProps<RuleGroupTypeAny, F, FullOperator, FullCombinator>,
    'fields' | 'baseField' | 'autoSelectField' | 'inferFieldDefaults'
  >
): UseFields<F> => {
  const {
    optionList: fields,
    optionsMap: fieldMap,
    defaultOption: defaultField,
  } = useMemo(() => {
    const prepared = prepareOptionList({
      placeholder: props.translations.fields,
      optionList: props.fields,
      autoSelectOption: props.autoSelectField,
      baseOption: props.baseField,
    });
    // `defaultOption` is always the placeholder (no `datatype`), so no inference needed
    return { ...prepared, ...inferFieldListDefaults(prepared, props.inferFieldDefaults) };
  }, [
    props.autoSelectField,
    props.baseField,
    props.fields,
    props.inferFieldDefaults,
    props.translations.fields,
  ]);
  return { fields, fieldMap, defaultField };
};
