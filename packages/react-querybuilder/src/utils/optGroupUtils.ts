import type { Field, Option, OptionGroup, OptionList } from '../types/index.noReact';

/**
 * Determines if an {@link OptionList} is an {@link OptionGroup} array.
 */
export const isOptionGroupArray = (arr: Field['values']): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && 'options' in arr[0];

/**
 * Gets the option from an {@link OptionList} with the given `name`. Handles
 * {@link Option} arrays as well as {@link OptionGroup} arrays.
 */
export const getOption = <OptType extends Option = Option>(
  arr: OptionList<OptType>,
  name: string
): OptType | undefined =>
  (isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr).find(op => op.name === name);

/**
 * Gets the first option from an {@link OptionList}.
 */
export const getFirstOption = (arr?: OptionList) =>
  !Array.isArray(arr) || arr.length === 0
    ? null
    : isOptionGroupArray(arr)
    ? arr[0].options[0].name
    : arr[0].name;
