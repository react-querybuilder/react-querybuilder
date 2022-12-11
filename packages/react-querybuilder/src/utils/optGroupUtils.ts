import type { Field, NameLabelPair, OptionGroup } from '@react-querybuilder/ts/src/index.noReact';

export const isOptionGroupArray = (arr: Field['values']): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && 'options' in arr[0];

export const getOption = <OptType extends NameLabelPair = NameLabelPair>(
  arr: OptType[] | OptionGroup<OptType>[],
  name: string
): OptType | undefined =>
  (isOptionGroupArray(arr) ? arr.flatMap(og => og.options) : arr).find(op => op.name === name);

export const getFirstOption = (arr?: NameLabelPair[] | OptionGroup[]) =>
  !Array.isArray(arr) || arr.length === 0
    ? null
    : isOptionGroupArray(arr)
    ? arr[0].options[0].name
    : arr[0].name;
