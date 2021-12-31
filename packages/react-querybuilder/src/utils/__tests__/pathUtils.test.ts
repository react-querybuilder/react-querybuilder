import type { RuleGroupType, RuleGroupTypeIC } from '../../types';
import {
  findPath,
  getCommonAncestorPath,
  getParentPath,
  isAncestor,
  pathsAreEqual,
} from '../pathUtils';

const query: RuleGroupType = {
  combinator: 'and',
  id: '111',
  rules: [
    {
      id: '222',
      field: 'firstName',
      value: 'Test',
      operator: '=',
    },
    {
      id: '333',
      field: 'firstName',
      value: 'Test',
      operator: '=',
    },
    {
      combinator: 'and',
      id: '444',
      rules: [
        {
          id: '555',
          field: 'firstName',
          value: 'Test',
          operator: '=',
        },
      ],
    },
  ],
};

const queryIC: RuleGroupTypeIC = {
  id: '111',
  rules: [
    { id: '222', field: 'firstName', value: 'Test', operator: '=' },
    'and',
    { id: '333', field: 'lastName', value: 'Test', operator: '=' },
    'and',
    {
      id: '444',
      rules: [
        {
          id: '555',
          field: 'firstName',
          value: 'Test',
          operator: '=',
        },
      ],
    },
  ],
};

describe('pathUtils', () => {
  describe('findPath', () => {
    describe('standard rule groups', () => {
      it('should find a root rule', () => {
        expect(findPath([], query).id).toBe('111');
      });

      it('should find a sub rule', () => {
        expect(findPath([2, 0], query).id).toBe('555');
      });

      it('should not find an invalid path', () => {
        expect(findPath([7, 7, 7], query)).toBeUndefined();
      });
    });

    describe('independent combinators', () => {
      it('should find a root rule', () => {
        expect(findPath([], queryIC).id).toBe('111');
      });

      it('should find a sub rule', () => {
        expect(findPath([4, 0], queryIC).id).toBe('555');
      });

      it('should not find an invalid path', () => {
        expect(findPath([7, 7, 7], queryIC)).toBeUndefined();
      });

      it('should return null for combinator elements', () => {
        expect(findPath([1], queryIC)).toBeNull();
        expect(findPath([3], queryIC)).toBeNull();
      });
    });
  });

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
