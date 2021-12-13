import uniqByName from '../uniqByName';

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
