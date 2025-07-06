import type { ComboboxData } from '@mantine/core';
import type { FullOption, FullOptionList } from 'react-querybuilder';
import { isOptionGroupArray, parseNumber, uniqOptList } from 'react-querybuilder';

export const optionListToComboboxData = (list: FullOptionList<FullOption>): ComboboxData => {
  const uniqList = uniqOptList(list);
  return isOptionGroupArray(uniqList)
    ? uniqList.map(og => ({ ...og, group: og.label, items: og.options }))
    : uniqList.map(opt => ({ name: opt.name, value: opt.name, label: opt.label }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toNumberInputValue = (val: number | string): any => {
  if (typeof val === 'number') return val;
  const valParsed = parseNumber(val, { parseNumbers: 'native' });
  if (!Number.isNaN(valParsed)) return valParsed;
  return '';
};
