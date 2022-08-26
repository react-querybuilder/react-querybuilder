import { Select } from 'antd';
import type { NameLabelPair, OptionGroup } from 'react-querybuilder';
import { isOptionGroupArray } from 'react-querybuilder';

const { OptGroup, Option } = Select;

export { isOptionGroupArray };

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
