import type { FullField } from '../types';
import { inferFieldDefaults, inferFieldListDefaults } from './inferFieldDefaults';
import { prepareOptionList, toFullOption } from './optGroupUtils';

const f = (props: Partial<FullField>): FullField =>
  toFullOption({ name: 'f', label: 'F', ...props } as FullField);

describe('inferFieldDefaults', () => {
  it.each([
    ['int', { inputType: 'number' }],
    ['boolean', { valueEditorType: 'checkbox' }],
    ['date', { inputType: 'date' }],
    ['timestamp', { inputType: 'datetime-local' }],
    ['time', { inputType: 'time' }],
  ])('%s', (datatype, fills) => {
    expect(inferFieldDefaults(f({ datatype }))).toEqual({ ...f({ datatype }), ...fills });
  });

  it('fills select for enum w/ values', () => {
    const values = [{ name: 'a', label: 'A' }];
    expect(inferFieldDefaults(f({ datatype: 'enum', values })).valueEditorType).toBe('select');
  });

  it.each(['bigint', 'string', 'json', 'array', 'enum', 'string|int', 'whatever', undefined])(
    'fills nothing for %s',
    datatype => {
      const fd = f({ datatype });
      expect(inferFieldDefaults(fd)).toBe(fd);
    }
  );

  it('does not use hints', () => {
    const fd = f({ values: [{ name: 'a', label: 'A' }] });
    expect(inferFieldDefaults(fd)).toBe(fd);
  });

  it('never overrides', () => {
    const fd1 = f({ datatype: 'int', inputType: 'text' });
    expect(inferFieldDefaults(fd1)).toBe(fd1);
    const fd2 = f({ datatype: 'bool', valueEditorType: () => 'switch' });
    expect(inferFieldDefaults(fd2)).toBe(fd2);
  });

  it('does not mutate', () => {
    const fd = f({ datatype: 'int' });
    const result = inferFieldDefaults(fd);
    expect(result).not.toBe(fd);
    expect(fd.inputType).toBeUndefined();
  });

  it('uses datatypeMap', () => {
    expect(
      inferFieldDefaults(f({ datatype: 'yesno' }), { datatypeMap: { yesno: 'boolean' } })
        .valueEditorType
    ).toBe('checkbox');
  });
});

describe('inferFieldListDefaults', () => {
  const fields = [
    { name: 'a', label: 'A', datatype: 'int' },
    { name: 'b', label: 'B' },
  ];
  const prepared = prepareOptionList({ optionList: fields });

  it('returns same objects when disabled or unchanged', () => {
    for (const opts of [undefined, false] as const) {
      const r = inferFieldListDefaults(prepared, opts);
      expect(r.optionList).toBe(prepared.optionList);
      expect(r.optionsMap).toBe(prepared.optionsMap);
    }
    const noop = prepareOptionList({ optionList: [{ name: 'b', label: 'B' }] });
    expect(inferFieldListDefaults(noop, true).optionList).toBe(noop.optionList);
  });

  it('fills list and map', () => {
    const r = inferFieldListDefaults(prepared, true);
    expect((r.optionList as FullField[]).map(fd => fd.inputType)).toEqual(['number', undefined]);
    expect(r.optionsMap.a?.inputType).toBe('number');
    expect(r.optionsMap.b).toBe(prepared.optionsMap.b);
  });

  it('handles option groups', () => {
    const grouped = prepareOptionList({
      optionList: [
        { label: 'G1', options: [fields[0]] },
        { label: 'G2', options: [fields[1]] },
      ],
    });
    const r = inferFieldListDefaults(grouped, { datatypeMap: {} });
    const groups = r.optionList as unknown as { options: FullField[] }[];
    expect(groups[0].options[0].inputType).toBe('number');
    expect(groups[1]).toBe((grouped.optionList as unknown[])[1]);
  });

  it('handles option groups w/ empty groups', () => {
    const grouped = prepareOptionList({
      optionList: [
        { label: 'G0', options: [] },
        { label: 'G1', options: [fields[0]] },
      ],
    });
    const r = inferFieldListDefaults(grouped, true);
    const groups = r.optionList as unknown as { options: FullField[] }[];
    expect(groups[0].options).toEqual([]);
    expect(groups[1].options[0].inputType).toBe('number');
  });
});
