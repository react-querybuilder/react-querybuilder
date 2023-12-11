import mantineVersion from '@mantine/core/package.json';
import type { FullOption, FullOptionList, Option } from 'react-querybuilder';
import { isOptionGroupArray, uniqByIdentifier } from 'react-querybuilder';

export const optionListMapNameToValue = (
  list: FullOptionList<FullOption>
): Partial<FullOption>[] => {
  let listFlat: (Option & { group?: string; items?: Option[] })[] = [];

  if (isOptionGroupArray(list)) {
    const mantineMainVersion = parseInt(mantineVersion.version.split('.')[0]);
    if (mantineMainVersion >= 7) {
      return list.map(opt => ({
        group: opt.label,
        items: opt.options.map(o => ({
          name: o.name,
          value: o.name,
          label: o.label,
        })),
      }));
    } else {
      listFlat = uniqByIdentifier(
        listFlat.concat(
          ...list.map(opt =>
            opt.options.map(o => ({
              name: o.name,
              value: o.name,
              label: o.label,
              group: opt.label,
            }))
          )
        )
      );
      return listFlat.map(opt => ({
        name: opt.name,
        value: opt.name,
        label: opt.label,
        group: opt.group,
      }));
    }
  } else {
    listFlat = uniqByIdentifier(list);
    return listFlat.map(opt => ({ name: opt.name, value: opt.name, label: opt.label }));
  }
};

export const toNumberInputValue = (val: any) => {
  if (typeof val === 'number') return val;
  const valParseFloat = parseFloat(val);
  if (!isNaN(valParseFloat)) return valParseFloat;
  return '';
};
