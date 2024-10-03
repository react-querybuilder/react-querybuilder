import { MultiSelectItem, SelectItem } from '@tremor/react';
import * as React from 'react';
import type { Option, OptionList } from 'react-querybuilder';
import { isOptionGroupArray } from 'react-querybuilder';

export const toSelectItems = (list: OptionList, multi?: boolean): React.JSX.Element[] | null => {
  const flatList: Option[] = isOptionGroupArray(list) ? list.flatMap(og => og.options) : list;

  // istanbul ignore else
  if (Array.isArray(flatList)) {
    return flatList.map(opt =>
      multi ? (
        <MultiSelectItem key={opt.name} value={opt.name} aria-disabled={!!opt.disabled}>
          {opt.label}
        </MultiSelectItem>
      ) : (
        <SelectItem key={opt.name} value={opt.name} aria-disabled={!!opt.disabled}>
          {opt.label}
        </SelectItem>
      )
    );
  }

  // istanbul ignore next
  return null;
};
