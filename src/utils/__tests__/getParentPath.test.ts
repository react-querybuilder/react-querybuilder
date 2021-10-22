import getParentPath from '../getParentPath';

describe('getParentPath', () => {
  it('should work', () => {
    expect(getParentPath([])).toEqual([]);
    expect(getParentPath([0])).toEqual([]);
    expect(getParentPath([1, 2])).toEqual([1]);
    expect(getParentPath([1, 2, 3])).toEqual([1, 2]);
  });
});
