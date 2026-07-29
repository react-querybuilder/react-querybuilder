import type { Field, InputType, ValueEditorType, ValueSources } from '../../types';
import type { RAQBConfig, RAQBField, RAQBUnsupportedInfo } from './types';
import { raqbListValuesToOptions, raqbToRqbOperatorMap, raqbTreeValuesToOptions } from './utils';

/**
 * Options object for {@link parseRAQBFields}.
 */
export interface ParseRAQBFieldsOptions {
  /**
   * Character used to join nested (`!struct`/`!group`) field names. Defaults to the config's
   * `settings.fieldSeparator`, or `"."` (RAQB's own default).
   */
  fieldSeparator?: string;
  /**
   * Additional or overriding RAQB-to-RQB operator mappings, merged over the defaults. Should
   * match the `operatorMap` passed to {@link parseRAQB}.
   */
  operatorMap?: Record<string, string>;
  /**
   * When `true`, fields marked `hideForSelect` in the RAQB config are included in the output.
   *
   * @default false
   */
  includeHidden?: boolean;
  /**
   * Called for each RAQB field construct that could not be fully translated.
   */
  onUnsupported?: (info: RAQBUnsupportedInfo) => void;
}

const inputTypeMap: Record<string, InputType> = {
  text: 'text',
  number: 'number',
  price: 'number',
  slider: 'number',
  rangeslider: 'number',
  date: 'date',
  time: 'time',
  datetime: 'datetime-local',
};

const valueEditorTypeMap: Record<string, ValueEditorType> = {
  text: 'text',
  textarea: 'textarea',
  select: 'select',
  multiselect: 'multiselect',
  treeselect: 'select',
  treemultiselect: 'multiselect',
  boolean: 'checkbox',
};

/**
 * Converts the `fields` section of a
 * [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder) (RAQB)
 * `Config` into an RQB {@link index!Field Field} array suitable for the
 * {@link index!QueryBuilder QueryBuilder} component's `fields` prop.
 *
 * RAQB's nested `!struct` fields are flattened into dot-separated field names (matching the field
 * paths stored in RAQB query trees), and `!group` fields become fields with `matchModes` and
 * `subproperties`.
 */
const translateValueSources = (raqbField: RAQBField): ValueSources | undefined => {
  if (!raqbField.valueSources) return undefined;
  const sources = [
    ...new Set(
      raqbField.valueSources.map(vs =>
        vs === 'func' ? 'expression' : vs === 'const' ? 'value' : vs
      )
    ),
  ];
  return sources.length > 0 ? (sources as unknown as ValueSources) : undefined;
};

export function parseRAQBFields(
  config: RAQBConfig | RAQBConfig['fields'],
  options: ParseRAQBFieldsOptions = {}
): Field[] {
  const isFullConfig = !!(config as RAQBConfig | undefined)?.fields;
  const rawFields = (isFullConfig ? (config as RAQBConfig).fields : config) as
    | Record<string, RAQBField>
    | undefined;
  const separator =
    options.fieldSeparator ??
    (isFullConfig ? (config as RAQBConfig).settings?.fieldSeparator : undefined) ??
    '.';
  const operatorMap = { ...raqbToRqbOperatorMap, ...options.operatorMap };
  const report = (info: RAQBUnsupportedInfo) => options.onUnsupported?.(info);

  const translateOperators = (raqbField: RAQBField, fieldName: string): string[] | undefined => {
    if (!raqbField.operators) return undefined;
    const operators = raqbField.operators
      .filter(op => !raqbField.excludeOperators?.includes(op))
      .map(op => {
        const mapped = operatorMap[op];
        if (!mapped) {
          report({
            reason: 'operator',
            key: op,
            message: `RAQB operator "${op}" on field "${fieldName}" has no react-querybuilder equivalent; omitted.`,
          });
        }
        return mapped;
      })
      .filter(Boolean);
    // Deduplicate — several RAQB operators (e.g. `equal`/`select_equals`) map to the same
    // RQB operator.
    return operators.length > 0 ? [...new Set(operators)] : undefined;
  };

  const translateField = (raqbField: RAQBField, name: string): Field => {
    const field: Field = { name, label: raqbField.label ?? name };

    const inputType = inputTypeMap[raqbField.type];
    if (inputType) {
      field.inputType = inputType;
    }

    const valueEditorType = valueEditorTypeMap[raqbField.type];
    if (valueEditorType) {
      field.valueEditorType = valueEditorType;
    }

    const { listValues, treeValues } = raqbField.fieldSettings ?? {};
    const values = treeValues
      ? raqbTreeValuesToOptions(treeValues)
      : raqbListValuesToOptions(listValues);
    if (values.length > 0) {
      field.values = values;
      field.valueEditorType ??= 'select';
    }

    const operators = translateOperators(raqbField, name);
    if (operators) {
      field.operators = operators;
    }

    if (raqbField.defaultOperator) {
      const defaultOperator = operatorMap[raqbField.defaultOperator];
      if (defaultOperator) {
        field.defaultOperator = defaultOperator;
      }
    }

    if (raqbField.defaultValue !== undefined) {
      field.defaultValue = raqbField.defaultValue;
    }

    const valueSources = translateValueSources(raqbField);
    if (valueSources) {
      field.valueSources = valueSources;
    }

    return field;
  };

  const fields: Field[] = [];

  const walk = (entries: Record<string, RAQBField>, prefix: string) => {
    for (const [key, raqbField] of Object.entries(entries)) {
      if (!raqbField || typeof raqbField !== 'object') continue;

      const name = prefix ? `${prefix}${separator}${key}` : key;

      if (raqbField.hideForSelect && !options.includeHidden) continue;

      if (raqbField.type === '!struct') {
        walk(raqbField.subfields ?? {}, name);
        continue;
      }

      if (raqbField.type === '!group') {
        const field: Field = {
          name,
          label: raqbField.label ?? key,
          matchModes: true,
          subproperties: Object.entries(raqbField.subfields ?? {}).map(([subKey, subField]) =>
            translateField(subField, subKey)
          ),
        };
        fields.push(field);
        continue;
      }

      fields.push(translateField(raqbField, name));
    }
  };

  walk(rawFields ?? {}, '');

  return fields;
}
