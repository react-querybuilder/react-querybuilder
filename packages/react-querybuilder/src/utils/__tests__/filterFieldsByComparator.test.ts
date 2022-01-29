import type { Field, OptionGroup } from '../../types';
import { filterFieldsByComparator } from '../filterFieldsByComparator';

const fields: Field[] = [
  { name: 'f0', label: 'f0' },
  { name: 'f1', label: 'f1', valueSources: ['value'] },
  { name: 'f2', label: 'f2', valueSources: ['field'] },
  { name: 'f3', label: 'f3', valueSources: () => ['value', 'field'] },
  { name: 'f4', label: 'f4', comparator: 'group', group: 'g1' },
  { name: 'f5', label: 'f5', comparator: 'group', group: 'g1' },
  { name: 'f6', label: 'f6', comparator: 'group', group: 'g2' },
  { name: 'f7', label: 'f7', comparator: 'group', group: 'g2' },
  { name: 'f8', label: 'f8', comparator: f => f.name === 'f1' },
  { name: 'f9', label: 'f9', comparator: f => f.group === 'g2' },
];
const optionGroups: OptionGroup[] = [{ label: 'Option Group1', options: fields }];

it('filters fields by comparator', () => {
  expect(filterFieldsByComparator(fields[0], fields)).toHaveLength(fields.length - 1);
  expect(filterFieldsByComparator(fields[1], fields)).toHaveLength(fields.length - 1);
  expect(filterFieldsByComparator(fields[2], fields)).toHaveLength(fields.length - 1);
  expect(filterFieldsByComparator(fields[3], fields)).toHaveLength(fields.length - 1);
  expect(filterFieldsByComparator(fields[4], fields)).toHaveLength(1);
  expect(filterFieldsByComparator(fields[5], fields)).toHaveLength(1);
  expect(filterFieldsByComparator(fields[6], fields)).toHaveLength(1);
  expect(filterFieldsByComparator(fields[7], fields)).toHaveLength(1);
  expect(filterFieldsByComparator(fields[8], fields)).toHaveLength(1);
  expect(filterFieldsByComparator(fields[9], fields)).toHaveLength(2);

  expect(filterFieldsByComparator(fields[0], optionGroups)[0].options).toHaveLength(
    fields.length - 1
  );
  expect(filterFieldsByComparator(fields[1], optionGroups)[0].options).toHaveLength(
    fields.length - 1
  );
  expect(filterFieldsByComparator(fields[2], optionGroups)[0].options).toHaveLength(
    fields.length - 1
  );
  expect(filterFieldsByComparator(fields[3], optionGroups)[0].options).toHaveLength(
    fields.length - 1
  );
  expect(filterFieldsByComparator(fields[4], optionGroups)[0].options).toHaveLength(1);
  expect(filterFieldsByComparator(fields[5], optionGroups)[0].options).toHaveLength(1);
  expect(filterFieldsByComparator(fields[6], optionGroups)[0].options).toHaveLength(1);
  expect(filterFieldsByComparator(fields[7], optionGroups)[0].options).toHaveLength(1);
  expect(filterFieldsByComparator(fields[8], optionGroups)[0].options).toHaveLength(1);
  expect(filterFieldsByComparator(fields[9], optionGroups)[0].options).toHaveLength(2);
});
