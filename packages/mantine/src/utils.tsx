import type { Option, OptionList } from 'react-querybuilder';
import { isOptionGroupArray, uniqByName } from 'react-querybuilder';

export const optionListMapNameToValue = (list: OptionList) => {
  let listFlat: Option[] = [];

  if (isOptionGroupArray(list)) {
    listFlat = uniqByName(
      listFlat.concat(...list.map(opt => opt.options.map(o => ({ ...o, group: opt.label }))))
    );
  } else {
    listFlat = uniqByName(list);
  }

  return listFlat.map(opt => ({ ...opt, value: opt.name }));
};
