import type {
  BaseOption,
  FlexibleOptionGroup,
  FullOption,
  FullOptionList,
  GetOptionIdentifierType,
  Option,
  OptionGroup,
  OptionList,
} from '../types/index.noReact';
import { isPojo } from './misc';
import { uniqByIdentifier } from './uniq';

/**
 * Determines if an {@link OptionList} is an {@link OptionGroup} array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isOptionGroupArray = (arr: any): arr is OptionGroup<BaseOption>[] =>
  Array.isArray(arr) &&
  arr.length > 0 &&
  isPojo(arr[0]) &&
  'options' in arr[0] &&
  Array.isArray(arr[0].options);

/**
 * Determines if a {@link FlexibleOptionList} is a {@link FlexibleOptionGroup} array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFlexibleOptionGroupArray = (arr: any): arr is FlexibleOptionGroup[] => {
  if (Array.isArray(arr)) {
    for (const og of arr) {
      if (isPojo(og) && 'options' in og) {
        for (const opt of og.options) {
          if (isPojo(opt) && ('name' in opt || 'value' in opt)) {
            return true;
          }
          return false;
        }
      }
    }
  }
  return false;
};

/**
 * Determines if a {@link FlexibleOptionList} is a {@link OptionGroup} array of
 * {@link FullOption}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isFullOptionGroupArray = (arr: any): arr is OptionGroup<FullOption>[] => {
  if (Array.isArray(arr)) {
    for (const og of arr) {
      if (isPojo(og) && 'options' in og) {
        for (const opt of og.options) {
          if (isPojo(opt) && 'name' in opt && 'value' in opt) {
            return true;
          }
          return false;
        }
      }
    }
  }
  return false;
};

/**
 * Gets the option from an {@link OptionList} with the given `name`. Handles
 * {@link Option} arrays as well as {@link OptionGroup} arrays.
 */
export const getOption = <OptType extends Option = Option>(
  arr: OptionList<OptType>,
  name: string
): OptType | undefined =>
  (isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr).find(
    op => op.value === name || op.name === name
  );

/**
 * Gets the first option from an {@link OptionList}.
 */
export const getFirstOption = <Opt extends BaseOption>(
  arr?: FlexibleOptionGroup<Opt>[] | Opt[]
) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  } else if (isFlexibleOptionGroupArray(arr)) {
    for (const og of arr) {
      if (og.options.length > 0) {
        return (og.options[0].value ?? og.options[0].name) as GetOptionIdentifierType<Opt>;
      }
    }
    // istanbul ignore next
    return null;
  }

  return (arr[0].value ?? arr[0].name) as GetOptionIdentifierType<Opt>;
};

/**
 * Flattens {@link FlexibleOptionGroup} arrays into {@link BaseOption} arrays.
 * If the array is already flat, it is returned as is.
 */
export const toFlatOptionArray = <T extends FullOption, OL extends FullOptionList<T>>(arr: OL) =>
  uniqByIdentifier(isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr) as T[];
