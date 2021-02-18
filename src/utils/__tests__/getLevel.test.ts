import { getLevel } from '..';

describe('when calculating the level of a rule', () => {
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

  it('should be 0 for the top level', function () {
    expect(getLevel('111', 0, query)).toBe(0);
    expect(getLevel('222', 0, query)).toBe(0);
    expect(getLevel('333', 0, query)).toBe(0);
  });

  it('should be 1 for the second level', function () {
    expect(getLevel('444', 0, query)).toBe(1);
    expect(getLevel('555', 0, query)).toBe(1);
  });

  it('should handle an invalid id', function () {
    expect(getLevel('546', 0, query)).toBe(-1);
  });
});
