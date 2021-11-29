import findPath from '../findPath';
import type { RuleGroupType, RuleGroupTypeIC } from '../../types';

const query: RuleGroupType = {
  combinator: 'and',
  id: '111',
  rules: [
    {
      id: '222',
      field: 'firstName',
      value: 'Test',
      operator: '='
    },
    {
      id: '333',
      field: 'firstName',
      value: 'Test',
      operator: '='
    },
    {
      combinator: 'and',
      id: '444',
      rules: [
        {
          id: '555',
          field: 'firstName',
          value: 'Test',
          operator: '='
        }
      ]
    }
  ]
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
          operator: '='
        }
      ]
    }
  ]
};

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
