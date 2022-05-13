import { ListSubheader, MenuItem } from '@mui/material';
import type { Field, NameLabelPair, OptionGroup } from 'react-querybuilder';

export const isOptionGroupArray = (arr: Field['values']): arr is OptionGroup[] =>
  Array.isArray(arr) && arr.length > 0 && 'options' in arr[0];

export const toOptions = (arr?: NameLabelPair[] | OptionGroup[]) => {
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
  /* istanbul ignore else */
  if (Array.isArray(arr)) {
    return arr.map(opt => (
      <MenuItem key={opt.name} value={opt.name}>
        {opt.label}
      </MenuItem>
    ));
  }
  /* istanbul ignore next */
  return null;
};
