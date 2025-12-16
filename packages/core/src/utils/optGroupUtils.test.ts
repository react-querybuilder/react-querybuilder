import type { FullOption } from '../types';
import {
  getFirstOption,
  getOption,
  isFlexibleOptionArray,
  isFlexibleOptionGroupArray,
  isFullOptionArray,
  isFullOptionGroupArray,
  isOptionGroupArray,
  prepareOptionList,
  toFlatOptionArray,
  toFullOption,
  toFullOptionList,
  toFullOptionMap,
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

  it('accepts a string', () => {
    expect(toFullOption('v1')).toEqual({ name: 'v1', value: 'v1', label: 'v1' });
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
      { name: 'n1', value: 'n1', label: 'l1' },
      { name: 'n2', value: 'n2', label: 'l2' },
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
          { name: 'n1', value: 'n1', label: 'l1' },
          { name: 'n2', value: 'n2', label: 'l2' },
        ],
      },
    ]);
  });

  it('falls back to empty array', () => {
    // oxlint-disable no-explicit-any
    expect(toFullOptionList('' as any)).toEqual([]);
    expect(toFullOptionList(1 as any)).toEqual([]);
    expect(toFullOptionList({} as any)).toEqual([]);
    expect(toFullOptionList((() => {}) as any)).toEqual([]);
    // oxlint-enable no-explicit-any
  });
});

describe('toFullOptionMap', () => {
  it('converts an option array', () => {
    expect(
      toFullOptionMap({ n1: { name: 'n1', label: 'l1' }, n2: { name: 'n2', label: 'l2' } })
    ).toEqual({
      n1: { name: 'n1', value: 'n1', label: 'l1' },
      n2: { name: 'n2', value: 'n2', label: 'l2' },
    });
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
      expect(uniqOptList(opts)).toEqual(opts.map(o => Object.assign(o, { value: o.name })));
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

it('gets an option', () => {
  expect(
    getOption(
      [
        { name: 'test1', label: 'Test1' },
        { name: 'test2', label: 'Test2' },
      ],
      'test2'
    )
  ).toEqual({ name: 'test2', label: 'Test2' });
  expect(
    getOption(
      [
        {
          label: 'Test',
          options: [
            { name: 'test1', label: 'Test1' },
            { name: 'test2', label: 'Test2' },
          ],
        },
      ],
      'test2'
    )
  ).toEqual({ name: 'test2', label: 'Test2' });
});

it('handles invalid inputs', () => {
  expect(getFirstOption()).toBeNull();
  expect(getFirstOption([])).toBeNull();
  expect(isFlexibleOptionGroupArray([])).toBe(false);
  expect(isFlexibleOptionGroupArray({})).toBe(false);
});

it('identifies flexible option arrays', () => {
  expect(isFlexibleOptionArray('test')).toBe(false);
  expect(isFlexibleOptionArray([])).toBe(false);
  expect(isFlexibleOptionArray([{}])).toBe(false);
  expect(isFlexibleOptionArray(['test'])).toBe(false);
  expect(isFlexibleOptionArray([{ name: 'n', label: 'l' }])).toBe(true);
  expect(isFlexibleOptionArray([{ value: 'v', label: 'l' }])).toBe(true);
  expect(
    isFlexibleOptionArray([
      { name: 'n', label: 'l' },
      { value: 'v', label: 'l' },
    ])
  ).toBe(true);
  expect(isFlexibleOptionArray([{ name: 'n', value: 'v', label: 'l' }])).toBe(true);
  expect(
    isFlexibleOptionArray([
      { name: 'n', label: 'l' },
      { value: 'v', label: 'l' },
      { label: 'invalid' },
    ])
  ).toBe(false);
});

it('identifies full option arrays', () => {
  expect(isFullOptionArray('test')).toBe(false);
  expect(isFullOptionArray([])).toBe(false);
  expect(isFullOptionArray([{}])).toBe(false);
  expect(isFullOptionArray(['test'])).toBe(false);
  expect(isFullOptionArray([{ name: 'n', label: 'l' }])).toBe(false);
  expect(isFullOptionArray([{ value: 'v', label: 'l' }])).toBe(false);
  expect(
    isFullOptionArray([
      { name: 'n', label: 'l' },
      { value: 'v', label: 'l' },
    ])
  ).toBe(false);
  expect(isFullOptionArray([{ name: 'n', value: 'v', label: 'l' }])).toBe(true);
  expect(isFullOptionArray([{ name: 'n', value: 'v', label: 'l' }, { label: 'invalid' }])).toBe(
    false
  );
});

it('identifies flexible option group arrays', () => {
  expect(isFlexibleOptionGroupArray('test')).toBe(false);
  expect(isFlexibleOptionGroupArray([])).toBe(false);
  expect(isFlexibleOptionGroupArray([{}])).toBe(false);
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [] }])).toBe(false);
  expect(isFlexibleOptionGroupArray([{ label: 'l', options: [] }], { allowEmpty: true })).toBe(
    true
  );
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
  expect(isFullOptionGroupArray([{ label: 'l', options: [] }], { allowEmpty: true })).toBe(true);
  expect(isFullOptionGroupArray([{ label: 'l', options: ['test'] }])).toBe(false);
  expect(isFullOptionGroupArray([{ label: 'l', options: [{ name: 'n', label: 'l' }] }])).toBe(
    false
  );
  expect(
    isFullOptionGroupArray([{ label: 'l', options: [{ name: 'n', value: 'v', label: 'l' }] }])
  ).toBe(true);
  expect(
    isFullOptionGroupArray([
      { label: 'l', options: [{ name: 'n', value: 'v', label: 'l' }] },
      { label: 'invalid' },
    ])
  ).toBe(false);
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

describe('prepareOptionList', () => {
  describe('basic functionality', () => {
    it('works with minimal props', () => {
      const result = prepareOptionList({});
      expect(result.defaultOption).toEqual({ id: '~', name: '~', value: '~', label: '------' });
      expect(result.optionList).toEqual([result.defaultOption]);
      expect(result.optionsMap).toEqual({ '~': result.defaultOption });
    });

    it('works with custom placeholder values', () => {
      const result = prepareOptionList({
        placeholder: {
          placeholderName: 'custom',
          placeholderLabel: 'Custom Label',
          placeholderGroupLabel: 'Custom Group',
        },
      });
      expect(result.defaultOption).toEqual({
        id: 'custom',
        name: 'custom',
        value: 'custom',
        label: 'Custom Label',
      });
    });

    it('works with baseOption and labelMap', () => {
      const result = prepareOptionList({
        optionList: [{ name: 'opt1', label: 'Original' }],
        baseOption: { customProp: 'test' },
        labelMap: { opt1: 'Mapped Label 1' },
      });
      expect(result.optionList[0]).toEqual({
        name: 'opt1',
        value: 'opt1',
        label: 'Original',
        customProp: 'test',
      });
    });
  });

  describe('array-based option lists', () => {
    it('handles flat option arrays with autoSelectOption true', () => {
      const result = prepareOptionList({
        optionList: [
          { name: 'opt1', label: 'Option 1' },
          { name: 'opt2', label: 'Option 2' },
        ],
        autoSelectOption: true,
      });
      expect(result.optionList).toEqual([
        { name: 'opt1', value: 'opt1', label: 'Option 1' },
        { name: 'opt2', value: 'opt2', label: 'Option 2' },
      ]);
      expect(result.optionsMap).toEqual({
        opt1: { name: 'opt1', value: 'opt1', label: 'Option 1' },
        opt2: { name: 'opt2', value: 'opt2', label: 'Option 2' },
      });
    });

    it('handles flat option arrays with autoSelectOption false', () => {
      const result = prepareOptionList({
        optionList: [
          { name: 'opt1', label: 'Option 1' },
          { name: 'opt2', label: 'Option 2' },
        ],
        autoSelectOption: false,
      });
      expect(result.optionList).toEqual([
        { id: '~', name: '~', value: '~', label: '------' },
        { name: 'opt1', value: 'opt1', label: 'Option 1' },
        { name: 'opt2', value: 'opt2', label: 'Option 2' },
      ]);
      expect(result.optionsMap['~']).toEqual(result.defaultOption);
      expect(result.optionsMap.opt1).toEqual({ name: 'opt1', value: 'opt1', label: 'Option 1' });
    });

    it('handles option group arrays with autoSelectOption true', () => {
      const result = prepareOptionList({
        optionList: [
          {
            label: 'Group 1',
            options: [
              { name: 'opt1', label: 'Option 1' },
              { name: 'opt2', label: 'Option 2' },
            ],
          },
        ],
        autoSelectOption: true,
      });
      expect(result.optionList).toEqual([
        {
          label: 'Group 1',
          options: [
            { name: 'opt1', value: 'opt1', label: 'Option 1' },
            { name: 'opt2', value: 'opt2', label: 'Option 2' },
          ],
        },
      ]);
      expect(result.optionsMap).toEqual({
        opt1: { name: 'opt1', value: 'opt1', label: 'Option 1' },
        opt2: { name: 'opt2', value: 'opt2', label: 'Option 2' },
      });
    });

    it('handles option group arrays with autoSelectOption false', () => {
      const result = prepareOptionList({
        optionList: [{ label: 'Group 1', options: [{ name: 'opt1', label: 'Option 1' }] }],
        autoSelectOption: false,
        placeholder: { placeholderGroupLabel: 'Custom Group' },
      });
      expect(result.optionList[0]).toEqual({
        label: 'Custom Group',
        options: [{ id: '~', name: '~', value: '~', label: '------' }],
      });
      expect(result.optionList[1]).toEqual({
        label: 'Group 1',
        options: [{ name: 'opt1', value: 'opt1', label: 'Option 1' }],
      });
    });

    it('handles empty arrays', () => {
      const result = prepareOptionList({ optionList: [] });
      expect(result.optionList).toEqual([]);
      expect(result.optionsMap).toEqual({});
    });

    it('removes duplicates from flat arrays', () => {
      const result = prepareOptionList({
        optionList: [
          { name: 'opt1', label: 'Option 1' },
          { name: 'opt1', label: 'Duplicate' },
          { name: 'opt2', label: 'Option 2' },
        ],
        autoSelectOption: true,
      });
      expect(result.optionList).toEqual([
        { name: 'opt1', value: 'opt1', label: 'Option 1' },
        { name: 'opt2', value: 'opt2', label: 'Option 2' },
      ]);
    });
  });

  describe('BaseOptionMap-based option lists', () => {
    it('handles object-based option lists with autoSelectOption true', () => {
      const result = prepareOptionList({
        optionList: {
          opt1: { name: 'opt1', label: 'Option 1' },
          opt2: { name: 'opt2', label: 'Option 2' },
        },
        autoSelectOption: true,
      });

      expect(result.optionList).toHaveLength(2);
      expect(getOption(result.optionList, 'opt1')).toEqual({
        name: 'opt1',
        value: 'opt1',
        label: 'Option 1',
      });
      expect(result.optionsMap).toEqual({
        opt1: { name: 'opt1', value: 'opt1', label: 'Option 1' },
        opt2: { name: 'opt2', value: 'opt2', label: 'Option 2' },
      });
    });

    it('handles object-based option lists with autoSelectOption false', () => {
      const result = prepareOptionList({
        optionList: { opt1: { name: 'opt1', label: 'Option 1' } },
        autoSelectOption: false,
      });

      expect(result.optionsMap['~']).toEqual(result.defaultOption);
      expect(result.optionsMap.opt1).toEqual({
        name: 'opt1',
        value: 'opt1',
        label: 'Option 1',
      });
    });

    it('sorts object-based options by label', () => {
      const result = prepareOptionList({
        optionList: {
          opt2: { name: 'opt2', label: 'Z Option' },
          opt1: { name: 'opt1', label: 'A Option' },
          opt3: { name: 'opt3', label: 'M Option' },
        },
        autoSelectOption: true,
      });

      expect(result.optionList[0].label).toBe('A Option');
      expect(result.optionList[1].label).toBe('M Option');
      expect(result.optionList[2].label).toBe('Z Option');
    });
  });

  describe('edge cases', () => {
    it('handles undefined optionList', () => {
      const result = prepareOptionList({ optionList: undefined });
      expect(result.optionList).toEqual([result.defaultOption]);
    });

    it('handles null optionList', () => {
      const result = prepareOptionList({ optionList: null as unknown as undefined });
      expect(result.optionList).toEqual([result.defaultOption]);
    });

    it('works with mixed option types', () => {
      const result = prepareOptionList({
        optionList: [
          { name: 'opt1', label: 'Option 1' },
          { value: 'opt2', label: 'Option 2' },
          { name: 'opt3', value: 'val3', label: 'Option 3' },
        ],
        autoSelectOption: true,
      });
      expect(result.optionList).toEqual([
        { name: 'opt1', value: 'opt1', label: 'Option 1' },
        { name: 'opt2', value: 'opt2', label: 'Option 2' },
        { name: 'opt3', value: 'val3', label: 'Option 3' },
      ]);
    });

    it('handles option groups with mixed option types', () => {
      const result = prepareOptionList({
        optionList: [
          {
            label: 'Mixed Group',
            options: [
              { name: 'opt1', label: 'Option 1' },
              { value: 'opt2', label: 'Option 2' },
            ],
          },
        ],
        autoSelectOption: true,
      });
      expect(result.optionsMap).toEqual({
        opt1: { name: 'opt1', value: 'opt1', label: 'Option 1' },
        opt2: { name: 'opt2', value: 'opt2', label: 'Option 2' },
      });
    });

    it('works with baseOption parameter for object-based lists', () => {
      const result = prepareOptionList({
        optionList: { opt1: { name: 'opt1', label: 'Option 1' } },
        baseOption: { customProp: 'base' },
        autoSelectOption: true,
      });
      expect(result.optionsMap.opt1).toEqual({
        name: 'opt1',
        value: 'opt1',
        label: 'Option 1',
        customProp: 'base',
      });
    });
  });

  describe('optionsMap building', () => {
    it('builds optionsMap for nested option groups', () => {
      const result = prepareOptionList({
        optionList: [
          { label: 'Group 1', options: [{ name: 'opt1', label: 'Option 1' }] },
          { label: 'Group 2', options: [{ name: 'opt2', label: 'Option 2' }] },
        ],
        autoSelectOption: true,
      });
      expect(result.optionsMap).toEqual({
        opt1: { name: 'opt1', value: 'opt1', label: 'Option 1' },
        opt2: { name: 'opt2', value: 'opt2', label: 'Option 2' },
      });
    });

    it('applies baseOption when building optionsMap for arrays', () => {
      const result = prepareOptionList({
        optionList: [{ name: 'opt1', label: 'Option 1' }],
        baseOption: { category: 'test' },
        autoSelectOption: true,
      });
      expect(result.optionsMap.opt1).toEqual({
        name: 'opt1',
        value: 'opt1',
        label: 'Option 1',
        category: 'test',
      });
    });

    it('applies baseOption when building optionsMap for option groups', () => {
      const result = prepareOptionList({
        optionList: [{ label: 'Group', options: [{ name: 'opt1', label: 'Option 1' }] }],
        baseOption: { category: 'test' },
        autoSelectOption: true,
      });
      expect(result.optionsMap.opt1).toEqual({
        name: 'opt1',
        value: 'opt1',
        label: 'Option 1',
        category: 'test',
      });
    });
  });
});
