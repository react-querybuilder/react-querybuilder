import type { Field, NameLabelPair, OptionGroup } from '../types';

export const isOptionGroupArray = (arr: Field['values']): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && 'options' in arr[0];

export const toOptions = (arr?: NameLabelPair[] | OptionGroup[]) =>
  isOptionGroupArray(arr)
    ? arr.map(og => (
        <optgroup key={og.label} label={og.label}>
          {og.options.map(opt => (
            <option key={opt.name} value={opt.name}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))
    : Array.isArray(arr)
    ? arr.map(opt => (
        <option key={opt.name} value={opt.name}>
          {opt.label}
        </option>
      ))
    : /* istanbul ignore next */ null;

export const getFirstOption = (arr?: NameLabelPair[] | OptionGroup[]) =>
  !Array.isArray(arr) || arr.length === 0
    ? /* istanbul ignore next */ null
    : isOptionGroupArray(arr)
    ? arr[0].options[0].name
    : arr[0].name;
