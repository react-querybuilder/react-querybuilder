import { findPath } from '..';
import { RuleGroupType } from '../..';

describe('findPath', () => {
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
