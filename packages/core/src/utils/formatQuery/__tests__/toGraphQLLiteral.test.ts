import { formatQuery } from '../formatQuery';
import { toGraphQLLiteral } from '../toGraphQLLiteral';

const opts = { enumKeys: ['operator'] };

describe('toGraphQLLiteral', () => {
  it('scalars', () => {
    expect(toGraphQLLiteral(null)).toBe('null');
    expect(toGraphQLLiteral(true)).toBe('true');
    expect(toGraphQLLiteral(1.5)).toBe('1.5');
    expect(toGraphQLLiteral(9007199254740993n)).toBe('9007199254740993');
    expect(toGraphQLLiteral('a"b\\c\n')).toBe(String.raw`"a\"b\\c\n"`);
  });

  it('objects, arrays, enums, undefined', () => {
    expect(
      toGraphQLLiteral(
        {
          operator: 'Or',
          operands: [{ operator: 'Equal', path: ['a'], valueText: 'Or', x: undefined }],
        },
        opts
      )
    ).toBe('{operator: Or, operands: [{operator: Equal, path: ["a"], valueText: "Or"}]}');
    expect(toGraphQLLiteral({ operator: ['A', 'B'] }, opts)).toBe('{operator: [A, B]}');
    expect(toGraphQLLiteral({ operator: 'Equal' })).toBe('{operator: "Equal"}');
  });

  it('throws on invalid input', () => {
    expect(() => toGraphQLLiteral({ operator: 'a b' }, opts)).toThrow('enum');
    expect(() => toGraphQLLiteral({ 'a-b': 1 })).toThrow('name');
    expect(() => toGraphQLLiteral(Number.NaN)).toThrow('number');
    expect(() => toGraphQLLiteral(() => 1)).toThrow('Unsupported');
  });

  it('round-trips a weaviate filter', () => {
    const where = formatQuery(
      {
        combinator: 'and',
        not: true,
        rules: [
          { field: 'a', operator: 'in', value: [1, 2] },
          { field: 'b', operator: 'contains', value: `x") { id } #` },
        ],
      },
      'weaviate'
    );
    expect(toGraphQLLiteral(where, opts)).toBe(
      '{operator: Not, operands: [{operator: And, operands: [{operator: ContainsAny, path: ["a"], valueInt: [1, 2]}, {operator: Like, path: ["b"], valueText: "*x\\") { id } #*"}]}]}'
    );
  });
});
