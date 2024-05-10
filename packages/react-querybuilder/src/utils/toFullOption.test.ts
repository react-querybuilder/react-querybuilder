import { toFullOption, toFullOptionList } from './toFullOption';

describe('toFullOption', () => {
  it('adds value', () => {
    expect(toFullOption({ name: 'n1', label: 'l1' })).toEqual({
      name: 'n1',
      value: 'n1',
      label: 'l1',
    });
  });

  it('adds name', () => {
    expect(toFullOption({ value: 'n1', label: 'l1' })).toEqual({
      name: 'n1',
      value: 'n1',
      label: 'l1',
    });
  });

  it('retains value', () => {
    expect(toFullOption({ name: 'n1', value: 'v1', label: 'l1' })).toEqual({
      name: 'n1',
      value: 'v1',
      label: 'l1',
    });
  });

  it('retains reference', () => {
    const o = { name: 'n1', value: 'v1', label: 'l1' };
    expect(toFullOption(o)).toBe(o);
  });

  it('adds base properties', () => {
    const o = { value: 'v1', label: 'l1' };
    const base = { someDefault: 'property' };
    expect(toFullOption(o, base)).toEqual({
      name: 'v1',
      value: 'v1',
      label: 'l1',
      someDefault: 'property',
    });
  });
});

describe('toFullOptionList', () => {
  it('converts an option array', () => {
    expect(
      toFullOptionList([
        { name: 'n1', label: 'l1' },
        { name: 'n2', label: 'l2' },
      ])
    ).toEqual([
      {
        name: 'n1',
        value: 'n1',
        label: 'l1',
      },
      {
        name: 'n2',
        value: 'n2',
        label: 'l2',
      },
    ]);
  });

  it('converts an option group array', () => {
    expect(
      toFullOptionList([
        {
          label: 'lg',
          options: [
            { name: 'n1', label: 'l1' },
            { name: 'n2', label: 'l2' },
          ],
        },
      ])
    ).toEqual([
      {
        label: 'lg',
        options: [
          {
            name: 'n1',
            value: 'n1',
            label: 'l1',
          },
          {
            name: 'n2',
            value: 'n2',
            label: 'l2',
          },
        ],
      },
    ]);
  });
});
