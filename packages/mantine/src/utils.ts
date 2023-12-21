import type { ComboboxData } from '@mantine/core';
import type { FullOption, FullOptionList } from 'react-querybuilder';
import { isOptionGroupArray, uniqByIdentifier, uniqOptList } from 'react-querybuilder';

export const optionListToComboboxData = (list: FullOptionList<FullOption>): ComboboxData =>
  isOptionGroupArray(list)
    ? uniqOptList(list).map(og => ({ ...og, group: og.label, items: og.options }))
    : uniqByIdentifier(list).map(opt => ({ name: opt.name, value: opt.name, label: opt.label }));

export const toNumberInputValue = (val: any) => {
  if (typeof val === 'number') return val;
  const valParseFloat = parseFloat(val);
  if (!isNaN(valParseFloat)) return valParseFloat;
  return '';
};
