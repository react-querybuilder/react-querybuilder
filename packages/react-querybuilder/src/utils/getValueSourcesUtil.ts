import type { FullField, GetOptionIdentifierType, ValueSources } from '../types/index.noReact';
import { toFullOption } from './toFullOption';

const defaultValueSourcesArray: ValueSources = ['value'];

const dummyFD = {
  name: 'name',
  value: 'name',
  valueSources: null,
  label: 'label',
};

/**
 * Utility function to get the value sources array for the given
 * field and operator. If the field definition does not define a
 * `valueSources` property, the `getValueSources` prop is used.
 * Returns `["value"]` by default.
 */
export const getValueSourcesUtil = <F extends FullField, O extends string>(
  fieldData: F,
  operator: string,
  getValueSources?: (
    field: GetOptionIdentifierType<F>,
    operator: O,
    misc: { fieldData: F }
  ) => ValueSources
): ValueSources => {
  // TypeScript doesn't allow it directly, but in practice
  // `fieldData` can end up being undefined or null. The nullish
  // coalescing assignment below avoids errors like
  // "TypeError: Cannot read properties of undefined (reading 'name')"
  const fd = fieldData ? toFullOption(fieldData) : /* istanbul ignore else */ dummyFD;

  if (fd.valueSources) {
    if (typeof fd.valueSources === 'function') {
      return fd.valueSources(operator as O);
    }
    return fd.valueSources;
  }
  if (getValueSources) {
    const vals = getValueSources(fd.value as GetOptionIdentifierType<F>, operator as O, {
      fieldData: toFullOption(fd) as F,
    });
    /* istanbul ignore else */
    if (vals) return vals;
  }

  return defaultValueSourcesArray;
};
