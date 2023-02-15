import { uniqByName, uniqOptGroups } from './uniq';

describe('uniqByName', () => {
  it('returns the same array if no duplicates are found', () => {
    expect(
      uniqByName([
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ])
    ).toEqual([
      { id: 1, name: 'test1' },
      { id: 2, name: 'test2' },
    ]);
  });

  it('removes second duplicate', () => {
    expect(
      uniqByName([
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
          { id: 1, name: 'test1', label: 'Test1' },
          { id: 2, name: 'test2', label: 'Test2' },
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
          { id: 1, name: 'test1', label: 'Test1' },
          { id: 2, name: 'test2', label: 'Test2' },
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
          { id: 1, name: 'test1', label: 'Test1' },
          { id: 2, name: 'test2', label: 'Test2' },
        ],
      },
      {
        label: 'Test 2',
        options: [{ id: 3, name: 'test3', label: 'Test3' }],
      },
    ]);
  });
});
