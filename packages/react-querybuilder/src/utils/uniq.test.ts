import { uniqByIdentifier, uniqByName, uniqOptGroups, uniqOptList } from './uniq';

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
