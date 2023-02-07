import type { OptionList } from '@react-querybuilder/ts';
import { isOptionGroupArray } from 'react-querybuilder';
import type { RQBMaterialComponents } from './types';

export { isOptionGroupArray };

type ToOptionsOptions = Pick<RQBMaterialComponents, 'ListSubheader' | 'MenuItem'>;

export const toOptions = (arr: OptionList, { ListSubheader, MenuItem }: ToOptionsOptions) => {
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
  /* c8 ignore else */
  if (Array.isArray(arr)) {
    return arr.map(opt => (
      <MenuItem key={opt.name} value={opt.name}>
        {opt.label}
      </MenuItem>
    ));
  }
  /* c8 ignore next */
  return null;
};
