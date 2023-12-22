import { Option, OptionGroup } from '@fluentui/react-components';
import * as React from 'react';
import type { OptionList } from 'react-querybuilder';
import { isOptionGroupArray } from 'react-querybuilder';

export const toDropdownOptions = (list: OptionList) =>
  isOptionGroupArray(list)
    ? list.map(og => (
        <OptionGroup key={og.label} label={og.label}>
          {og.options.map(opt => (
            <Option key={opt.name} value={opt.name}>
              {opt.label}
            </Option>
          ))}
        </OptionGroup>
      ))
    : Array.isArray(list)
      ? list.map(opt => (
          <Option key={opt.name} value={opt.name}>
            {opt.label}
          </Option>
        ))
      : // istanbul ignore next
        null;
