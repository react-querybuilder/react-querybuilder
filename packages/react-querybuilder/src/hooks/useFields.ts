import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionRecord,
  OptionGroup,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import { useMemo } from 'react';
import type { QueryBuilderProps, TranslationsFull } from '../types';

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
  const {
    optionList: fields,
    optionsMap: fieldMap,
    defaultOption: defaultField,
  } = useMemo(
    () =>
      prepareOptionList({
        placeholder: props.translations.fields,
        optionList: props.fields,
        autoSelectOption: props.autoSelectField,
        baseOption: props.baseField,
      }),
    [props.autoSelectField, props.baseField, props.fields, props.translations.fields]
  );
  return { fields, fieldMap, defaultField };
};
