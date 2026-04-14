import type { JSX } from 'react';
import * as React from 'react';
import type { OptionList } from 'react-querybuilder';
import { isOptionGroupArray } from 'react-querybuilder';
import type { RQBMaterialComponents } from './types';

export { isOptionGroupArray };

type ToOptionsOptions = Pick<RQBMaterialComponents, 'ListSubheader' | 'MenuItem'>;

// v8 ignore next
const defaultToOptionsOptions: ToOptionsOptions = {
  ListSubheader: () => null,
  MenuItem: () => <></>,
};

export const toOptions = (
  // v8 ignore next
  arr: OptionList = [],
  // v8 ignore next
  { ListSubheader, MenuItem }: ToOptionsOptions = defaultToOptionsOptions
): JSX.Element[] | null => {
  if (isOptionGroupArray(arr)) {
    const optArray: JSX.Element[] = [];
    for (const og of arr) {
      optArray.push(
        <ListSubheader key={og.label}>{og.label}</ListSubheader>,
        ...og.options.map(opt => (
          <MenuItem key={opt.name} value={opt.name}>
            {opt.label}
          </MenuItem>
        ))
      );
    }
    return optArray;
  }
  /* v8 ignore else -- @preserve */
  if (Array.isArray(arr)) {
    return arr.map(opt => (
      <MenuItem key={opt.name} value={opt.name}>
        {opt.label}
      </MenuItem>
    ));
  }
  /* v8 ignore next -- @preserve */
  return null;
};
