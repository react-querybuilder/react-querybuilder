import type {
  FullField,
  FullOptionList,
  Option,
  OptionList,
  RuleType,
  ValueEditorType,
} from '../types';
import { joinWith } from './arrayUtils';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { getFirstOption } from './optGroupUtils';

// First option of a list, paired for `between`/`notBetween` operators (array or joined string).
const getFirstOptionsFrom = (opts: OptionList, r: RuleType, listsAsArrays?: boolean) => {
  const firstOption = getFirstOption(opts);

  if (r.operator === 'between' || r.operator === 'notBetween') {
    const valueAsArray = [firstOption, firstOption];
    return listsAsArrays
      ? valueAsArray
      : joinWith(
          valueAsArray.map(
            v => v ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
          ),
          ','
        );
  }

  return firstOption;
};

/** Options for {@link getRuleDefaultValue}. */
export interface GetRuleDefaultValueOptions<F extends FullField = FullField> {
  /** Resolved field configuration for `rule.field` (e.g. `fieldMap[rule.field] ?? {}`). */
  fieldData: F;
  /** Full field list, used to seed a comparator-valid field when `valueSource` is `'field'`. */
  fields: FullOptionList<F>;
  /** Resolves the editor type for the field/operator (drives select/radio/checkbox defaults). */
  getValueEditorType: (field: string, operator: string, meta: { fieldData: F }) => ValueEditorType;
  /** Resolves the value option list for the field/operator. */
  getValues: (field: string, operator: string, meta: { fieldData: F }) => FullOptionList<Option>;
  /** Optional escape hatch overriding the computed default. */
  getDefaultValue?: (rule: RuleType, meta: { fieldData: F }) => unknown;
  /** Named parameter options, used to seed a default when `valueSource` is `'parameter'`. */
  parameters?: OptionList | null;
  /** When `true`, multi-value defaults are arrays instead of comma-joined strings. */
  listsAsArrays?: boolean;
}

/**
 * Computes the default `value` for a rule given its `field`/`operator`/`valueSource`, mirroring
 * the precedence the {@link react-querybuilder!QueryBuilder QueryBuilder} applies: a field's
 * `defaultValue`, then a `getDefaultValue` override, then a value derived from the field/operator's
 * value list and editor type (first option for `select`/`radio`, `false` for `checkbox`, paired for
 * `between`/`notBetween`), or a comparator-valid field when `valueSource` is `'field'`. Falls back
 * to `''`.
 *
 * @group Option Lists
 */
export const getRuleDefaultValue = <F extends FullField = FullField>(
  rule: RuleType,
  options: GetRuleDefaultValueOptions<F>
): unknown => {
  const {
    fieldData,
    fields,
    getValueEditorType,
    getValues,
    getDefaultValue,
    parameters,
    listsAsArrays,
  } = options;

  if (fieldData?.defaultValue !== undefined && fieldData.defaultValue !== null) {
    return fieldData.defaultValue;
  } else if (getDefaultValue) {
    return getDefaultValue(rule, { fieldData });
  }

  let value: string | (string | null)[] | boolean | null = '';

  const values = getValues(rule.field, rule.operator, { fieldData });

  if (rule.valueSource === 'field') {
    const filteredFields = filterFieldsByComparator(fieldData, fields, rule.operator);
    value =
      filteredFields.length > 0 ? getFirstOptionsFrom(filteredFields, rule, listsAsArrays) : '';
  } else if (rule.valueSource === 'parameter') {
    value = parameters && parameters.length > 0 ? getFirstOption(parameters) : '';
  } else if (values.length > 0) {
    const editorType = getValueEditorType(rule.field, rule.operator, { fieldData });
    if (editorType === 'multiselect') {
      value = listsAsArrays ? [] : '';
    } else if (editorType === 'select' || editorType === 'radio') {
      value = getFirstOptionsFrom(values, rule, listsAsArrays);
    }
  } else {
    const editorType = getValueEditorType(rule.field, rule.operator, { fieldData });
    if (editorType === 'checkbox') {
      value = false;
    }
  }

  return value;
};
