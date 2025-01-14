import type { FullOption } from '../types';
import {
  getFirstOption,
  isFlexibleOptionGroupArray,
  isFullOptionGroupArray,
  isOptionGroupArray,
  toFlatOptionArray,
  toFullOption,
  toFullOptionList,
  uniqByIdentifier,
  uniqByName,
  uniqOptGroups,
  uniqOptList,
} from './optGroupUtils';

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

describe('uniqByName', () => {
  const opts = [
    { id: 1, name: 'test1' },
    { id: 2, name: 'test2' },
  ];
  it('matches uniqByIdentifier', () => {
    expect(uniqByName(opts)).toBe(uniqByIdentifier(opts));
  });
});

describe('uniqByIdentifier', () => {
  it('returns the same array if no duplicates are found', () => {
    const opts = [
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ];
    expect(uniqByIdentifier(opts)).toBe(opts);
  });

  it('removes second duplicate', () => {
    expect(
      uniqByIdentifier([
        { id: 1, name: 'test' },
        { id: 2, name: 'test' },
      ])
    ).toEqual([{ id: 1, name: 'test' }]);
  });
});

describe('uniqOptGroups', () => {
  it('returns the same array if no duplicates are found', () => {
    expect(
      uniqOptGroups([
        {
          label: 'Test',
          options: [
            { id: 1, name: 'test1', label: 'Test1' },
            { id: 2, name: 'test2', label: 'Test2' },
          ],
        },
      ])
    ).toEqual([
      {
        label: 'Test',
        options: [
          { id: 1, name: 'test1', value: 'test1', label: 'Test1' },
          { id: 2, name: 'test2', value: 'test2', label: 'Test2' },
        ],
      },
    ]);
  });

  it('removes second duplicate', () => {
    expect(
      uniqOptGroups([
        {
          label: 'Test',
          options: [
            { id: 1, name: 'test1', label: 'Test1' },
            { id: 2, name: 'test2', label: 'Test2' },
          ],
        },
        {
          label: 'Test',
          options: [
            { id: 3, name: 'test3', label: 'Test3' },
            { id: 4, name: 'test4', label: 'Test4' },
          ],
        },
      ])
    ).toEqual([
      {
        label: 'Test',
        options: [
          { id: 1, name: 'test1', value: 'test1', label: 'Test1' },
          { id: 2, name: 'test2', value: 'test2', label: 'Test2' },
        ],
      },
    ]);
  });

  it('removes inner duplicates', () => {
    expect(
      uniqOptGroups([
        {
          label: 'Test 1',
          options: [
            { id: 1, name: 'test1', label: 'Test1' },
            { id: 2, name: 'test2', label: 'Test2' },
          ],
        },
        {
          label: 'Test 2',
          options: [
            { id: 3, name: 'test3', label: 'Test3' },
            { id: 4, name: 'test1', label: 'Test4' },
          ],
        },
      ])
    ).toEqual([
      {
        label: 'Test 1',
        options: [
          { id: 1, name: 'test1', value: 'test1', label: 'Test1' },
          { id: 2, name: 'test2', value: 'test2', label: 'Test2' },
        ],
      },
      {
        label: 'Test 2',
        options: [{ id: 3, name: 'test3', value: 'test3', label: 'Test3' }],
      },
    ]);
  });
});

describe('uniqOptList', () => {
  describe('option arrays', () => {
    it('returns the same array if no duplicates are found', () => {
      const opts = [
        { id: 1, name: 'test1', label: 'test1' },
        { id: 2, name: 'test2', label: 'test2' },
      ];
      expect(uniqOptList(opts)).toEqual(opts.map(o => ({ ...o, value: o.name })));
    });

    it('removes second duplicate', () => {
      expect(
        uniqOptList([
          { id: 1, name: 'test', label: 'test1' },
          { id: 2, name: 'test', label: 'test2' },
        ])
      ).toEqual([{ id: 1, name: 'test', value: 'test', label: 'test1' }]);
    });
  });

  describe('option group arrays', () => {
    it('returns the same array if no duplicates are found', () => {
      expect(
        uniqOptList([
          {
            label: 'Test',
            options: [
              { id: 1, name: 'test1', label: 'Test1' },
              { id: 2, name: 'test2', label: 'Test2' },
            ],
          },
        ])
      ).toEqual([
        {
          label: 'Test',
          options: [
            { id: 1, name: 'test1', value: 'test1', label: 'Test1' },
            { id: 2, name: 'test2', value: 'test2', label: 'Test2' },
          ],
        },
      ]);
    });

    it('removes second duplicate', () => {
      expect(
        uniqOptList([
          {
            label: 'Test',
            options: [
              { id: 1, name: 'test1', label: 'Test1' },
              { id: 2, name: 'test2', label: 'Test2' },
            ],
          },
          {
            label: 'Test',
            options: [
              { id: 3, name: 'test3', label: 'Test3' },
              { id: 4, name: 'test4', label: 'Test4' },
            ],
          },
        ])
      ).toEqual([
        {
          label: 'Test',
          options: [
            { id: 1, name: 'test1', value: 'test1', label: 'Test1' },
            { id: 2, name: 'test2', value: 'test2', label: 'Test2' },
          ],
        },
      ]);
    });

    it('removes inner duplicates', () => {
      expect(
        uniqOptList([
          {
            label: 'Test 1',
            options: [
              { id: 1, name: 'test1', label: 'Test1' },
              { id: 2, name: 'test2', label: 'Test2' },
            ],
          },
          {
            label: 'Test 2',
            options: [
              { id: 3, name: 'test3', label: 'Test3' },
              { id: 4, name: 'test1', label: 'Test4' },
            ],
          },
        ])
      ).toEqual([
        {
          label: 'Test 1',
          options: [
            { id: 1, name: 'test1', value: 'test1', label: 'Test1' },
            { id: 2, name: 'test2', value: 'test2', label: 'Test2' },
          ],
        },
        {
          label: 'Test 2',
          options: [{ id: 3, name: 'test3', value: 'test3', label: 'Test3' }],
        },
      ]);
    });
  });
});

it('identifies option group arrays', () => {
  expect(isOptionGroupArray([])).toBe(false);
  expect(isOptionGroupArray([{ name: 'test', label: 'Test' }])).toBe(false);
  expect(isOptionGroupArray([{ label: 'Test', options: [] }])).toBe(true);
});

it('gets the first option', () => {
  expect(
    getFirstOption([
      { name: 'test2', label: 'Test2' },
      { name: 'test1', label: 'Test1' },
    ])
  ).toBe('test2');
  expect(
    getFirstOption([
      {
        label: 'Test',
        options: [
          { name: 'test2', label: 'Test2' },
          { name: 'test1', label: 'Test1' },
        ],
      },
    ])
  ).toBe('test2');
  expect(
    getFirstOption([
      { label: 'Empty', options: [] },
      {
        label: 'Test',
        options: [
          { name: 'test2', label: 'Test2' },
          { name: 'test1', label: 'Test1' },
        ],
      },
    ])
  ).toBe('test2');
});

it('handles invalid inputs', () => {
  expect(getFirstOption()).toBeNull();
  expect(getFirstOption([])).toBeNull();
  expect(isFlexibleOptionGroupArray([])).toBe(false);
  expect(isFlexibleOptionGroupArray({})).toBe(false);
});

it('identifies flexible option group arrays', () => {
  expect(isFlexibleOptionGroupArray('test')).toBe(false);
  expect(isFlexibleOptionGroupArray([])).toBe(false);
  expect(isFlexibleOptionGroupArray([{}])).toBe(false);
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [] }])).toBe(false);
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: ['test'] }])).toBe(false);
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [{ name: 'n', label: 'l' }] }])).toBe(
    true
  );
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [{ value: 'v', label: 'l' }] }])).toBe(
    true
  );
  expect(
    isFlexibleOptionGroupArray([
      {
        label: 'l',
        options: [
          { name: 'n', label: 'l' },
          { value: 'v', label: 'l' },
        ],
      },
    ])
  ).toBe(true);
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [{ label: 'l' }] }])).toBe(false);
  expect(
    isFlexibleOptionGroupArray([
      {
        label: 'l',
        options: [
          { name: 'n', label: 'l' },
          { value: 'v', label: 'l' },
          { name: 'n', value: 'v', label: 'l' },
          { label: 'l' },
        ],
      },
    ])
  ).toBe(false);
});

it('identifies full option group arrays', () => {
  expect(isFullOptionGroupArray('test')).toBe(false);
  expect(isFullOptionGroupArray([])).toBe(false);
  expect(isFullOptionGroupArray([{}])).toBe(false);
  expect(isFullOptionGroupArray([{ label: 'l', options: [] }])).toBe(false);
  expect(isFullOptionGroupArray([{ label: 'l', options: ['test'] }])).toBe(false);
  expect(isFullOptionGroupArray([{ label: 'l', options: [{ name: 'n', label: 'l' }] }])).toBe(
    false
  );
  expect(
    isFullOptionGroupArray([{ label: 'l', options: [{ name: 'n', value: 'v', label: 'l' }] }])
  ).toBe(true);
  expect(
    isFullOptionGroupArray([
      {
        label: 'l',
        options: [
          { name: 'n', value: 'v', label: 'l' },
          { name: 'n', label: 'l' },
        ],
      },
    ])
  ).toBe(false);
});

describe('toFlatOptionArray', () => {
  const arr: FullOption[] = [
    { name: 'test1', label: 'Test1' },
    { name: 'test2', label: 'Test2' },
    { name: 'test2', label: 'Test3' },
  ].map(o => toFullOption(o));

  it('returns option arrays as is instead of flattening', () => {
    expect(toFlatOptionArray(arr)).toEqual(arr.slice(0, 2));
  });

  it('flattens option group arrays', () => {
    expect(toFlatOptionArray([{ label: 'test', options: arr }])).toEqual(arr.slice(0, 2));
  });
});
