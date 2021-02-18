import generateValidQuery from '../generateValidQuery';
import { RuleGroupType } from '../../types';

describe('generateValidQuery', () => {
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
      const validQuery = generateValidQuery(queryWithID) as RuleGroupType;
      expect(validQuery.id).toBe('g-12345');
      expect(validQuery.rules[0].id).toBe('r-12345');
    });
  });

  describe('when initial query, without ID, is provided', () => {
    const queryWithoutID = {
      combinator: 'and',
      rules: [
        {
          field: 'firstName',
          value: 'Test without ID',
          operator: '='
        }
      ]
    };

    it('should generate IDs if missing in query', () => {
      expect(queryWithoutID).not.toHaveProperty('id');
      const validQuery = generateValidQuery(queryWithoutID as RuleGroupType) as RuleGroupType;
      expect(validQuery).toHaveProperty('id');
      expect(validQuery.rules[0]).toHaveProperty('id');
    });
  });
});
