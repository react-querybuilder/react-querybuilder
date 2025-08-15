import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionRecord,
  OptionGroup,
  QueryBuilderProps,
  RuleGroupTypeAny,
  TranslationsFull,
} from '../types';
import { useOptionListProp } from './useOptionListProp';

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
  const { optionList, optionsMap, defaultOption } = useOptionListProp({
    placeholder: props.translations.fields,
    optionList: props.fields,
    autoSelectOption: props.autoSelectField,
    baseOption: props.baseField,
  });
  return {
    fields: optionList,
    fieldMap: optionsMap,
    defaultField: defaultOption,
  };
};
