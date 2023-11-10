import type { FullOption, FullOptionList, Option } from 'react-querybuilder';
import { isOptionGroupArray, uniqByIdentifier } from 'react-querybuilder';

export const optionListMapNameToValue = (list: FullOptionList<FullOption>): FullOption[] => {
  let listFlat: (Option & { group?: string })[] = [];

  if (isOptionGroupArray(list)) {
    listFlat = uniqByIdentifier(
      listFlat.concat(
        ...list.map(opt =>
          opt.options.map(o => ({ name: o.name, value: o.name, label: o.label, group: opt.label }))
        )
      )
    );
  } else {
    listFlat = uniqByIdentifier(list);
  }

  return listFlat.map(opt => ({ name: opt.name, value: opt.name, label: opt.label }));
};

export const toNumberInputValue = (val: any) => {
  if (typeof val === 'number') return val;
  const valParseFloat = parseFloat(val);
  if (!isNaN(valParseFloat)) return valParseFloat;
  return '';
};
