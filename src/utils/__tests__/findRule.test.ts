import { findRule } from '..';

describe('findRule', () => {
  const query = {
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
    expect(findRule('111', query)).toBeDefined();
  });

  it('should find a sub rule', () => {
    expect(findRule('555', query)).toBeDefined();
  });

  it('should not find an invalid id', () => {
    expect(findRule('777', query)).toBeUndefined;
  });
});
