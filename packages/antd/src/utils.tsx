import { Select } from 'antd';
import * as React from 'react';
import type { OptionList } from 'react-querybuilder';
import { isOptionGroupArray } from 'react-querybuilder';

const { OptGroup, Option } = Select;

export { isOptionGroupArray };

export const toOptions = (arr?: OptionList) =>
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
