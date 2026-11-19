import type { Field, FullField } from '../types';
import { datatypeCategoryComparator } from './datatypeCategoryComparator';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { toFullOption } from './optGroupUtils';

const fields = (
  [
    { name: 'age', label: 'Age', datatype: 'int', comparator: datatypeCategoryComparator },
    { name: 'price', label: 'Price', datatype: 'numeric(10,2)' },
    { name: 'big', label: 'Big', datatype: 'bigint' },
    { name: 'name', label: 'Name', datatype: 'varchar(50)' },
    { name: 'born', label: 'Born', datatype: 'date', comparator: datatypeCategoryComparator },
    { name: 'created', label: 'Created', datatype: 'timestamp' },
    { name: 't', label: 'T', datatype: 'time' },
    {
      name: 'mixed',
      label: 'Mixed',
      datatype: 'string|int',
      comparator: datatypeCategoryComparator,
    },
    { name: 'none', label: 'None', comparator: datatypeCategoryComparator },
  ] satisfies Field[]
).map(o => toFullOption(o));

const names = (fs: unknown) => (fs as FullField[]).map(f => f.name);

describe('datatypeCategoryComparator', () => {
  it('matches numeric family', () => {
    expect(names(filterFieldsByComparator(fields[0], fields, '='))).toEqual([
      'price',
      'big',
      'mixed',
    ]);
  });

  it('matches temporal date family, not time', () => {
    expect(names(filterFieldsByComparator(fields[4], fields, '='))).toEqual(['created']);
  });

  it('matches multi-type on overlap', () => {
    expect(names(filterFieldsByComparator(fields[7], fields, '='))).toEqual([
      'age',
      'price',
      'big',
      'name',
    ]);
  });

  it('excludes when category is null', () => {
    expect(names(filterFieldsByComparator(fields[8], fields, '='))).toEqual([]);
    expect(datatypeCategoryComparator(fields[0], '=')).toBe(false);
  });
});
