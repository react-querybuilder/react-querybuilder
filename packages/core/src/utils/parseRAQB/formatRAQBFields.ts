import type { Field, FullField, FullOption, InputType, ValueEditorType } from '../../types';
import { toFlatOptionArray, toFullOptionList } from '../optGroupUtils';
import type { RAQBField, RAQBListValue } from './types';
import { rqbToRaqbOperatorMap } from './utils';

/**
 * Options object for {@link formatRAQBFields}.
 */
export interface FormatRAQBFieldsOptions {
  /**
   * Character used to split nested (`!struct`) field names into RAQB `subfields`. Should match
   * the config's `settings.fieldSeparator`.
   *
   * @default '.'
   */
  fieldSeparator?: string;
  /**
   * Additional or overriding RQB-to-RAQB operator mappings, merged over the defaults. Should
   * match the `raqbOperatorMap` passed to `formatRAQB`.
   */
  operatorMap?: Record<string, string>;
  /**
   * When `true`, dot-separated field names are left flat instead of being nested into `!struct`
   * subfields.
   *
   * @default false
   */
  flat?: boolean;
}

/** RQB `inputType` → RAQB field `type`. Checked before {@link valueEditorTypeToRaqbType}. */
const inputTypeToRaqbType: Partial<Record<InputType, string>> = {
  text: 'text',
  number: 'number',
  date: 'date',
  time: 'time',
  'datetime-local': 'datetime',
};

/** RQB `valueEditorType` → RAQB field `type`. */
const valueEditorTypeToRaqbType: Partial<Record<Exclude<ValueEditorType, null>, string>> = {
  text: 'text',
  textarea: 'text',
  select: 'select',
  multiselect: 'multiselect',
  radio: 'select',
  checkbox: 'boolean',
  switch: 'boolean',
};

/** RQB `valueEditorType`s that RAQB expresses through `preferWidgets` rather than `type`. */
const valueEditorTypeToPreferWidgets: Partial<Record<Exclude<ValueEditorType, null>, string[]>> = {
  textarea: ['textarea'],
};

/** Flattens any of RQB's flexible option-list shapes to a plain {@link FullOption} array. */
// oxlint-disable-next-line typescript/no-explicit-any
const flatten = (list: any): FullOption[] => toFlatOptionArray(toFullOptionList(list));

const toRaqbListValues = (values: FullOption[]): RAQBListValue[] =>
  values.map(v => ({ value: v.value, title: v.label }));

/**
 * Converts an RQB `fields` array into the `fields` section of a
 * [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder) (RAQB)
 * `Config`.
 *
 * Inverse of {@link parseRAQBFields}. Dot-separated field names are re-nested into `!struct`
 * subfields, and fields with `matchModes`/`subproperties` become `!group` fields.
 */
export function formatRAQBFields(
  fields: Field[],
  options: FormatRAQBFieldsOptions = {}
): Record<string, RAQBField> {
  const separator = options.fieldSeparator ?? '.';
  const operatorMap = { ...rqbToRaqbOperatorMap, ...options.operatorMap };

  const translateOperators = (field: Field): string[] | undefined => {
    if (!Array.isArray(field.operators)) return undefined;
    const operators = flatten(field.operators)
      .map(op => operatorMap[op.value as keyof typeof operatorMap])
      .filter(op => !!op) as string[];
    return operators.length > 0 ? [...new Set(operators)] : undefined;
  };

  const translateField = (field: Field, label: string): RAQBField => {
    const values = field.values ? toRaqbListValues(flatten(field.values)) : [];

    const type =
      (field.inputType ? inputTypeToRaqbType[field.inputType] : undefined) ??
      (field.valueEditorType && typeof field.valueEditorType !== 'function'
        ? valueEditorTypeToRaqbType[field.valueEditorType]
        : undefined) ??
      (values.length > 0 ? 'select' : 'text');

    const raqbField: RAQBField = { type, label: field.label ?? label };

    const preferWidgets =
      field.valueEditorType && typeof field.valueEditorType !== 'function'
        ? valueEditorTypeToPreferWidgets[field.valueEditorType]
        : undefined;
    if (preferWidgets) {
      raqbField.preferWidgets = preferWidgets;
    }

    if (values.length > 0) {
      raqbField.fieldSettings = { listValues: values };
    }

    const operators = translateOperators(field);
    if (operators) {
      raqbField.operators = operators;
    }

    if (field.defaultOperator) {
      const defaultOperator = operatorMap[field.defaultOperator as keyof typeof operatorMap];
      if (defaultOperator) {
        raqbField.defaultOperator = defaultOperator;
      }
    }

    if (field.defaultValue !== undefined) {
      raqbField.defaultValue = field.defaultValue;
    }

    if (Array.isArray(field.valueSources)) {
      raqbField.valueSources = [
        ...new Set(
          field.valueSources
            .map(vs => (vs === 'expression' ? 'func' : vs))
            .filter(vs => vs === 'value' || vs === 'field' || vs === 'func')
        ),
      ] as RAQBField['valueSources'];
    }

    return raqbField;
  };

  const result: Record<string, RAQBField> = {};

  /** Walks the `!struct` chain implied by a dot-separated name, creating containers as needed. */
  const containerFor = (segments: string[]): Record<string, RAQBField> => {
    let container = result;
    let path = '';
    for (const segment of segments) {
      path = path ? `${path}${separator}${segment}` : segment;
      const existing = container[segment];
      if (!existing || existing.type !== '!struct') {
        container[segment] = { type: '!struct', label: segment, subfields: {} };
      }
      container = container[segment].subfields!;
    }
    return container;
  };

  for (const field of fields) {
    if (!field?.name) continue;

    const segments = options.flat ? [field.name] : field.name.split(separator);
    const key = segments.at(-1)!;
    const container = containerFor(segments.slice(0, -1));

    if (field.matchModes || Array.isArray(field.subproperties)) {
      const subfields: Record<string, RAQBField> = {};
      for (const sub of flatten(field.subproperties ?? []) as FullField[]) {
        if (!sub?.name) continue;
        subfields[sub.name] = translateField(sub, sub.name);
      }
      container[key] = {
        type: '!group',
        label: field.label ?? key,
        mode: 'array',
        subfields,
      };
      continue;
    }

    container[key] = translateField(field, key);
  }

  return result;
}
