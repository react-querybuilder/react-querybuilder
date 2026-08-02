import { defaultOperatorLabelMap } from '../defaults';
import type {
  FlexibleOptionList,
  FlexibleOptionListProp,
  FullField,
  FullOperator,
  FullOption,
  FullOptionList,
  Option,
  Placeholder,
  ValueEditorType,
} from '../types';
import { getFirstOption, prepareOptionList } from './optGroupUtils';

/**
 * Options shared by the resolvers below that produce a normalized option list.
 */
export interface ResolveOptionListOptions {
  /**
   * Prepended as an empty placeholder option when `autoSelectOption` is `false`. Supplied by the
   * `translations` prop in React; omit it where translations don't apply.
   */
  placeholder?: Placeholder;
  /** Properties applied to every option in the resulting list. */
  baseOption?: Record<string, unknown>;
  /** When `false`, an empty placeholder option is prepended. */
  autoSelectOption?: boolean;
}

/**
 * Resolves the operator list for a field, applying the same precedence as the `QueryBuilder`
 * component: the field's own `operators`, then the `getOperators` callback, then the
 * query-level operator list.
 *
 * @group Option Lists
 */
export const resolveOperatorList = <
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
>({
  field,
  fieldData,
  getOperators,
  operators,
  placeholder,
  baseOption,
  autoSelectOption,
}: {
  field: string;
  fieldData: F;
  getOperators?: (field: string, misc: { fieldData: F }) => FlexibleOptionList<O> | null;
  operators: FullOptionList<O>;
} & ResolveOptionListOptions): FullOptionList<O> =>
  prepareOptionList<O>({
    optionList: (fieldData?.operators ??
      getOperators?.(field, { fieldData }) ??
      operators) as FlexibleOptionListProp<O>,
    placeholder,
    baseOption,
    labelMap: defaultOperatorLabelMap,
    autoSelectOption,
  }).optionList;

/**
 * Resolves the default operator for a field, applying the same precedence as the `QueryBuilder`
 * component: the field's own `defaultOperator`, then the `getDefaultOperator` option (a string or
 * a function), then the first available operator.
 *
 * @group Option Lists
 */
export const resolveDefaultOperator = <F extends FullField = FullField>({
  field,
  fieldData,
  getDefaultOperator,
  getOperators,
}: {
  field: string;
  fieldData: F;
  getDefaultOperator?: string | ((field: string, misc: { fieldData: F }) => string);
  /** Produces the operator list for the field, i.e. {@link resolveOperatorList} already bound. */
  getOperators: (field: string, misc: { fieldData: F }) => FullOptionList<FullOperator>;
}): string => {
  if (fieldData?.defaultOperator) return fieldData.defaultOperator;

  if (getDefaultOperator) {
    return typeof getDefaultOperator === 'function'
      ? getDefaultOperator(field, { fieldData })
      : getDefaultOperator;
  }

  return getFirstOption(getOperators(field, { fieldData })) ?? '';
};

/**
 * Resolves the value editor type for a field/operator pair, applying the same precedence as the
 * `QueryBuilder` component: the field's own `valueEditorType` (a string or a function of the
 * operator), then the `getValueEditorType` callback, then `"text"`.
 *
 * @group Option Lists
 */
export const resolveValueEditorType = <F extends FullField = FullField>({
  field,
  operator,
  fieldData,
  getValueEditorType,
}: {
  field: string;
  operator: string;
  fieldData: F;
  getValueEditorType?: (field: string, operator: string, misc: { fieldData: F }) => ValueEditorType;
}): ValueEditorType => {
  if (fieldData?.valueEditorType) {
    return typeof fieldData.valueEditorType === 'function'
      ? fieldData.valueEditorType(operator)
      : fieldData.valueEditorType;
  }

  return getValueEditorType?.(field, operator, { fieldData }) ?? 'text';
};

/**
 * Resolves the value option list for a field/operator pair, applying the same precedence as the
 * `QueryBuilder` component: the field's own `values`, then the `getValues` callback, then an
 * empty list.
 *
 * @group Option Lists
 */
export const resolveValueList = <F extends FullField = FullField>({
  field,
  operator,
  fieldData,
  getValues,
  placeholder,
  autoSelectOption,
}: {
  field: string;
  operator: string;
  fieldData: F;
  getValues?: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => FlexibleOptionList<Option> | null;
} & ResolveOptionListOptions): FullOptionList<Option> =>
  prepareOptionList<FullOption>({
    optionList: fieldData?.values ?? getValues?.(field, operator, { fieldData }) ?? [],
    placeholder,
    autoSelectOption,
  }).optionList;
