import { Select } from 'antd';
import type { Field, NameLabelPair, OptionGroup } from 'react-querybuilder';

const { OptGroup, Option } = Select;

export const isOptionGroupArray = (arr: Field['values']): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && 'options' in arr[0];

export const toOptions = (arr?: NameLabelPair[] | OptionGroup[]) =>
  isOptionGroupArray(arr)
    ? arr.map(og => (
        <OptGroup key={og.label} label={og.label}>
          {og.options.map(opt => (
            <Option key={opt.name} value={opt.name}>
              {opt.label}
            </Option>
          ))}
        </OptGroup>
      ))
    : Array.isArray(arr)
    ? arr.map(opt => (
        <Option key={opt.name} value={opt.name}>
          {opt.label}
        </Option>
      ))
    : /* istanbul ignore next */ null;
