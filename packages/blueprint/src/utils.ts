import type { Option, OptionList } from 'react-querybuilder';
import { isOptionGroupArray, uniqByName } from 'react-querybuilder';

export const optionListMapNameToValue = (list: OptionList) => {
  let listFlat: (Option & { group?: string })[] = [];

  if (isOptionGroupArray(list)) {
    listFlat = uniqByName(
      listFlat.concat(
        ...list.map(opt =>
          opt.options.map(o => ({ name: o.name, value: o.name, label: o.label, group: opt.label }))
        )
      )
    );
  } else {
    listFlat = uniqByName(list);
  }

  return listFlat.map(opt => ({ name: opt.name, value: opt.name, label: opt.label }));
};
