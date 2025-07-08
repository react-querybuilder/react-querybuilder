import type {
  FullField,
  GetOptionIdentifierType,
  ValueSourceFlexibleOptions,
  ValueSourceFullOptions,
  ValueSources,
} from '../types';
import { lc } from './misc';
import { isFlexibleOptionArray, toFullOption, toFullOptionList } from './optGroupUtils';

const defaultValueSourcesArray: ValueSourceFullOptions = [
  { name: 'value', value: 'value', label: 'value' },
];

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
 * Returns `[FullOption<"value">]` by default.
 */
export const getValueSourcesUtil = <F extends FullField, O extends string>(
  fieldData: F,
  operator: string,
  getValueSources?: (
    field: GetOptionIdentifierType<F>,
    operator: O,
    misc: { fieldData: F }
  ) => ValueSources | ValueSourceFlexibleOptions
): ValueSourceFullOptions => {
  // TypeScript doesn't allow it directly, but in practice
  // `fieldData` can end up being undefined or null. The nullish
  // coalescing assignment below avoids errors like
  // "TypeError: Cannot read properties of undefined (reading 'name')"
  const fd = fieldData ? toFullOption(fieldData) : /* istanbul ignore next */ dummyFD;

  let valueSourcesNEW:
    | false
    | ValueSources
    | ValueSourceFlexibleOptions
    | ((operator: string) => ValueSources | ValueSourceFlexibleOptions) = fd.valueSources ?? false;

  if (typeof valueSourcesNEW === 'function') {
    valueSourcesNEW = valueSourcesNEW(operator as O);
  }

  if (!valueSourcesNEW && getValueSources) {
    valueSourcesNEW = getValueSources(fd.value as GetOptionIdentifierType<F>, operator as O, {
      fieldData: fd as F,
    });
  }

  if (!valueSourcesNEW) {
    return defaultValueSourcesArray;
  }

  if (isFlexibleOptionArray(valueSourcesNEW)) {
    return toFullOptionList(valueSourcesNEW as ValueSourceFullOptions) as ValueSourceFullOptions;
  }

  return valueSourcesNEW.map(
    vs =>
      defaultValueSourcesArray.find(dmm => dmm.value === lc(vs)) ?? {
        name: vs,
        value: vs,
        label: vs,
      }
  ) as ValueSourceFullOptions;
};
