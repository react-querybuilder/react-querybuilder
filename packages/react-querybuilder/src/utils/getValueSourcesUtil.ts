import type { Field, ToFullOption, ValueSources } from '../types/index.noReact';
import { toFullOption } from './toFullOption';

const defaultValueSourcesArray: ValueSources = ['value'];

/**
 * Utility function to get the value sources array for the given
 * field and operator. If the field definition does not define a
 * `valueSources` property, the `getValueSources` prop is used.
 * Returns `["value"]` by default.
 */
export const getValueSourcesUtil = (
  fieldData: Field,
  operator: string,
  getValueSources?: (
    field: string,
    operator: string,
    misc: { fieldData: ToFullOption<Field> }
  ) => ValueSources
): ValueSources => {
  // TypeScript doesn't allow it directly, but in practice
  // `fieldData` can end up being undefined or null. The nullish
  // coalescing assignment below avoids errors like
  // "TypeError: Cannot read properties of undefined (reading 'name')"
  const fd = fieldData ?? /* istanbul ignore else */ {};

  if (fd.valueSources) {
    if (typeof fd.valueSources === 'function') {
      return fd.valueSources(operator);
    }
    return fd.valueSources;
  }
  if (getValueSources) {
    const vals = getValueSources(fd.name, operator, { fieldData: toFullOption(fd) });
    /* istanbul ignore else */
    if (vals) return vals;
  }

  return defaultValueSourcesArray;
};
