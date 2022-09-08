import type {
  Field,
  NameLabelPair,
  OptionGroup,
} from '@react-querybuilder/ts/dist/types/src/index.noReact';

export const isOptionGroupArray = (arr: Field['values']): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && 'options' in arr[0];

export const getFirstOption = (arr?: NameLabelPair[] | OptionGroup[]) =>
  !Array.isArray(arr) || arr.length === 0
    ? null
    : isOptionGroupArray(arr)
    ? arr[0].options[0].name
    : arr[0].name;
