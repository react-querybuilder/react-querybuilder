import type {
  FlexibleOption,
  FlexibleOptionGroup,
  FlexibleOptionList,
  FullOption,
  GetOptionIdentifierType,
  Option,
  OptionGroup,
  OptionList,
} from '../types/index.noReact';
import { isPojo } from './misc';

/**
 * Determines if an {@link OptionList} is an {@link OptionGroup} array.
 */
export const isOptionGroupArray = (arr: any): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && isPojo(arr[0]) && 'options' in arr[0];

/**
 * Determines if a {@link FlexibleOptionList} is a {@link FlexibleOptionGroup} array.
 */
export const isFlexibleOptionGroupArray = (arr: any): arr is FlexibleOptionGroup[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  isPojo(arr[0]) &&
  'options' in arr[0] &&
  ((isPojo(arr[0].options[0]) && 'name' in arr[0].options[0]) ||
    (isPojo(arr[0].options[0]) && 'value' in arr[0].options[0]));

/**
 * Determines if a {@link FlexibleOptionList} is a {@link OptionGroup} array of
 * {@link FullOption}.
 */
export const isFullOptionGroupArray = (arr: any): arr is OptionGroup<FullOption>[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  isPojo(arr[0]) &&
  'options' in arr[0] &&
  isPojo(arr[0].options[0]) &&
  'name' in arr[0].options[0] &&
  isPojo(arr[0].options[0]) &&
  'value' in arr[0].options[0];

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
export const getFirstOption = <
  Opt extends FlexibleOption,
  OL extends FlexibleOptionList<FlexibleOption> = FlexibleOptionList<Opt>
>(
  arr?: OL
) =>
  (!Array.isArray(arr) || arr.length === 0
    ? null
    : isFlexibleOptionGroupArray(arr)
    ? arr[0].options[0].value ?? arr[0].options[0].name
    : arr[0].value ?? arr[0].name) as GetOptionIdentifierType<Opt>;
