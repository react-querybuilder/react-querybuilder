import { getCommonAncestorPath, getParentPath, isAncestor, pathsAreEqual } from '../pathUtils';

describe('pathUtils', () => {
  describe('getParentPath', () => {
    it('should work', () => {
      expect(getParentPath([])).toEqual([]);
      expect(getParentPath([0])).toEqual([]);
      expect(getParentPath([1, 2])).toEqual([1]);
      expect(getParentPath([1, 2, 3])).toEqual([1, 2]);
    });
  });

  describe('isAncestor', () => {
    it('should work', () => {
      expect(isAncestor([], [])).toBe(false);
      expect(isAncestor([], [0])).toBe(true);
      expect(isAncestor([], [0, 0])).toBe(true);
      expect(isAncestor([0, 1, 2], [0, 1, 2, 3, 4, 5])).toBe(true);
      expect(isAncestor([0, 1, 2, 4], [0, 1, 2, 3])).toBe(false);
    });
  });

  describe('pathsAreEqual', () => {
    it('should work', () => {
      expect(pathsAreEqual([], [])).toBe(true);
      expect(pathsAreEqual([0, 1, 2], [0, 1, 2])).toBe(true);
      expect(pathsAreEqual([0, 1, 2, 3], [0, 1, 2, 4])).toBe(false);
      expect(pathsAreEqual([0], [])).toBe(false);
      expect(pathsAreEqual([], [0])).toBe(false);
    });
  });

  describe('getCommonAncestorPath', () => {
    it('should work', () => {
      expect(getCommonAncestorPath([], [])).toEqual([]);
      expect(getCommonAncestorPath([0, 1, 2], [0, 1, 3])).toEqual([0, 1]);
      expect(getCommonAncestorPath([0, 1, 2, 3], [0, 1, 2, 4])).toEqual([0, 1, 2]);
      expect(getCommonAncestorPath([0], [])).toEqual([]);
      expect(getCommonAncestorPath([], [0])).toEqual([]);
      expect(getCommonAncestorPath([0], [1])).toEqual([]);
      expect(getCommonAncestorPath([0, 2, 3, 4], [0, 3, 4, 5])).toEqual([0]);
    });
  });
});
