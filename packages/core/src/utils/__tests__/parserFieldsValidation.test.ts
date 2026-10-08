import type { DefaultRuleGroupType, DefaultRuleType, FullField } from '../../types';
import { toFullOption } from '../optGroupUtils';
import { parseCEL } from '../parseCEL';
import { parseCypher } from '../parseCypher';
import { parseGremlin } from '../parseGremlin';
import { parseJSONata } from '../parseJSONata';
import { parseJsonLogic } from '../parseJsonLogic';
import { parseMongoDB } from '../parseMongoDB';
import { parseSPARQL } from '../parseSPARQL';
import { parseSpEL } from '../parseSpEL';
import { parseSQL } from '../parseSQL';

// Only `a` is valid; any rule referencing `b` must be dropped when `fields` is provided.
const fields: FullField[] = [toFullOption({ name: 'a', label: 'a' })];

const collectRules = (rg: DefaultRuleGroupType): DefaultRuleType[] =>
  rg.rules.flatMap(r => (typeof r === 'string' ? [] : 'rules' in r ? collectRules(r) : [r]));

type Parser = (q: never, opts: { fields: FullField[] }) => DefaultRuleGroupType;
type Matrix = [name: string, parser: Parser, queries: [invalid: unknown, valid: unknown][]];

const matrix: Matrix[] = [
  [
    'parseSQL',
    parseSQL,
    [
      ['b in (1, 2)', 'a in (1, 2)'],
      ['b not in (1, 2)', 'a not in (1, 2)'],
      ['b between 1 and 2', 'a between 1 and 2'],
      ['b not between 1 and 2', 'a not between 1 and 2'],
      ['b = 1', 'a = 1'],
    ],
  ],
  [
    'parseMongoDB',
    parseMongoDB,
    [
      [{ b: { $in: [1, 2] } }, { a: { $in: [1, 2] } }],
      [{ b: { $nin: [1, 2] } }, { a: { $nin: [1, 2] } }],
      [
        { $and: [{ b: { $gte: 1 } }, { b: { $lte: 2 } }] },
        { $and: [{ a: { $gte: 1 } }, { a: { $lte: 2 } }] },
      ],
      [
        { $or: [{ b: { $lt: 1 } }, { b: { $gt: 2 } }] },
        { $or: [{ a: { $lt: 1 } }, { a: { $gt: 2 } }] },
      ],
    ],
  ],
  [
    'parseJsonLogic',
    parseJsonLogic,
    [
      [{ in: [{ var: 'b' }, [1, 2]] }, { in: [{ var: 'a' }, [1, 2]] }],
      [{ '!': { in: [{ var: 'b' }, [1, 2]] } }, { '!': { in: [{ var: 'a' }, [1, 2]] } }],
      [{ '<=': [1, { var: 'b' }, 2] }, { '<=': [1, { var: 'a' }, 2] }],
      [{ '!': { '<=': [1, { var: 'b' }, 2] } }, { '!': { '<=': [1, { var: 'a' }, 2] } }],
    ],
  ],
  [
    'parseCEL',
    parseCEL,
    [
      ['b in [1, 2]', 'a in [1, 2]'],
      ['!(b in [1, 2])', '!(a in [1, 2])'],
      ['b >= 1 && b <= 2', 'a >= 1 && a <= 2'],
    ],
  ],
  [
    'parseSpEL',
    parseSpEL,
    [
      ['b between {1, 2}', 'a between {1, 2}'],
      ['!(b between {1, 2})', '!(a between {1, 2})'],
    ],
  ],
  [
    'parseJSONata',
    parseJSONata,
    [
      ['b in [1, 2]', 'a in [1, 2]'],
      ['$not(b in [1, 2])', '$not(a in [1, 2])'],
      ['b >= 1 and b <= 2', 'a >= 1 and a <= 2'],
    ],
  ],
];

describe.each(matrix)('%s', (_name, parser, queries) => {
  it.each(queries)('drops unknown field: %j', (invalid, valid) => {
    expect(collectRules(parser(invalid as never, { fields }))).toHaveLength(0);
    // Regression: known field kept
    const kept = collectRules(parser(valid as never, { fields }));
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every(r => r.field === 'a')).toBe(true);
  });
});

describe('parseSQL parameters', () => {
  it.each([
    ['b between ? and ?', 'a between ? and ?'],
    ['b in (?, ?)', 'a = ?'],
  ])('drops unknown field: %s', (invalid, valid) => {
    const opts = { fields, parseParameters: true };
    expect(collectRules(parseSQL(invalid, opts))).toHaveLength(0);
    expect(collectRules(parseSQL(valid, opts))).toHaveLength(1);
  });
});

// These parsers emit field names verbatim (`n.a` for Cypher, `?a` for SPARQL)
describe.each([
  [
    'parseCypher',
    parseCypher as Parser,
    'n.a',
    [
      ['n.b IN [1, 2]', 'n.a IN [1, 2]'],
      ['NOT n.b IN [1, 2]', 'NOT n.a IN [1, 2]'],
      ['n.b >= 1 AND n.b <= 2', 'n.a >= 1 AND n.a <= 2'],
      ['n.b = 1 OR n.b IS NULL', 'n.a = 1 OR n.a IS NULL'],
      ["MATCH (n) WHERE n.b CONTAINS 'x' RETURN n", "MATCH (n) WHERE n.a CONTAINS 'x' RETURN n"],
    ],
  ],
  [
    'parseGremlin',
    parseGremlin as Parser,
    'a',
    [
      ["g.V().has('b', within(1, 2))", "g.V().has('a', within(1, 2))"],
      ["g.V().has('b', without(1, 2))", "g.V().has('a', without(1, 2))"],
      ["g.V().has('b', between(1, 2))", "g.V().has('a', between(1, 2))"],
      ["g.V().has('b', outside(1, 2))", "g.V().has('a', outside(1, 2))"],
      ["g.V().has('b', 1).hasNot('b')", "g.V().has('a', 1).hasNot('a')"],
    ],
  ],
  [
    'parseSPARQL',
    parseSPARQL as Parser,
    '?a',
    [
      ['?b = 1', '?a = 1'],
      ['?b >= 1 && ?b <= 2', '?a >= 1 && ?a <= 2'],
      ['?b = 1 || ?b = 2', '?a = 1 || ?a = 2'],
      ['!(?b = 1 || ?b = 2)', '!(?a = 1 || ?a = 2)'],
      ['SELECT * WHERE { FILTER(!BOUND(?b)) }', 'SELECT * WHERE { FILTER(!BOUND(?a)) }'],
    ],
  ],
] as [string, Parser, string, [string, string][]][])('%s', (_name, parser, fieldName, queries) => {
  const flds = [toFullOption({ name: fieldName, label: fieldName })];

  it.each(queries)('drops unknown field: %s', (invalid, valid) => {
    expect(parser(invalid as never, { fields: flds }).rules).toHaveLength(0);
    const kept = collectRules(parser(valid as never, { fields: flds }));
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.every(r => r.field === fieldName)).toBe(true);
  });

  it('keeps everything without fields', () => {
    expect(collectRules(parser(queries[0][0] as never, {} as never)).length).toBeGreaterThan(0);
  });
});

it('prunes only invalid rules from mixed groups', () => {
  const cypherFields = [toFullOption({ name: 'n.a', label: 'a' })];
  expect(parseCypher('n.a = 1 AND (n.b = 2 OR n.a = 3)', { fields: cypherFields })).toEqual({
    combinator: 'and',
    rules: [
      { field: 'n.a', operator: '=', value: 1 },
      { combinator: 'or', rules: [{ field: 'n.a', operator: '=', value: 3 }] },
    ],
  });
});
