import generateValidQueryObject from '../generateValidQueryObject';
import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../../types';


describe('generateValidQueryObject', () => {
  describe('when initial query, with ID, is provided', () => {
    const queryWithID: RuleGroupType = {
      id: 'g-12345',
      combinator: 'and',
      rules: [
        {
          id: 'r-12345',
          field: 'firstName',
          value: 'Test',
          operator: '='
        }
      ]
    };

    it('should not generate new ID if query provides ID', () => {
      const validQuery = generateValidQueryObject(queryWithID);
      expect(validQuery.id).toBe('g-12345');
      expect(validQuery.path).toEqual([]);
      expect(validQuery.rules[0].id).toBe('r-12345');
      expect(validQuery.rules[0].path).toEqual([0]);
    });
  });

  describe('when initial query, without ID, is provided', () => {
    const queryWithoutID: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        }
      ]
    };
    const queryICWithoutID: RuleGroupTypeIC = {
      rules: [
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        },
        'and',
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        }
      ]
    };

    it('should generate IDs if missing in query', () => {
      expect(queryWithoutID).not.toHaveProperty('id');
      const validQuery = generateValidQueryObject(queryWithoutID);
      expect(validQuery).toHaveProperty('id');
      expect(validQuery.path).toEqual([]);
      expect(validQuery.rules[0]).toHaveProperty('id');
      expect(validQuery.rules[0].path).toEqual([0]);
    });

    it('should generate IDs only for valid query objects', () => {
      expect(queryICWithoutID).not.toHaveProperty('id');
      const validQuery = generateValidQueryObject(queryICWithoutID);
      expect(validQuery).toHaveProperty('id');
      expect(validQuery.path).toEqual([]);
      expect(validQuery.rules[0]).toHaveProperty('id');
      expect((validQuery.rules[0] as RuleType).path).toEqual([0]);
      expect(validQuery.rules[1] as string).toBe('and');
      expect((validQuery.rules[2] as RuleType).path).toEqual([2]);
    });
  });
});
