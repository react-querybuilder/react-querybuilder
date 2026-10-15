import type { RuleGroupType } from '../../../types';
import { formatQuery } from '../formatQuery';

// GHSA-g9qh-gcxj-jf82: backslash before quote must not close the string literal
const ops = ['=', 'contains', 'beginsWith', 'endsWith', 'in', 'between'] as const;
const q = (value: string): RuleGroupType => ({
  combinator: 'and',
  rules: ops.map(operator => ({
    field: 'f',
    operator,
    value: operator === 'between' ? [value, value] : value,
  })),
});

const sq = String.raw`\' OR 1=1 //`;
const dq = String.raw`\" OR 1=1 //`;

describe('string value escaping', () => {
  it.each<['cypher' | 'gql' | 'gremlin' | 'cel' | 'sparql' | 'spel' | 'milvus', string, string]>([
    ['cypher', sq, String.raw`f = '\\\' OR 1=1 //'`],
    ['gql', sq, String.raw`f = '\\\' OR 1=1 //'`],
    ['gremlin', sq, String.raw`.has('f', '\\\' OR 1=1 //')`],
    ['cel', dq, String.raw`f == "\\\" OR 1=1 //"`],
    ['sparql', dq, String.raw`?f = "\\\" OR 1=1 //"`],
    ['spel', sq, String.raw`f == '\'' OR 1=1 //'`],
    ['milvus', dq, String.raw`f == "\\\" OR 1=1 //"`],
  ])('%s', (format, value, expected) => {
    const result = formatQuery(q(value), format);
    expect(result).toContain(expected);
  });

  it('spel leaves backslashes literal and doubles quotes', () => {
    expect(formatQuery(q(String.raw`a\b'c`), 'spel')).toContain(String.raw`f == 'a\b''c'`);
    expect(formatQuery(q(`it's`), 'spel')).toContain(`f matches '.*it''s.*'`);
  });
});
