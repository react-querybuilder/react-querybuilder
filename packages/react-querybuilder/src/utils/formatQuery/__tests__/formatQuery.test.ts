import type { FormatQueryOptions, RuleGroupType, RuleType } from '../../../types/index.noReact';
import { convertToIC } from '../../convertQuery';
import { prepareRuleGroup } from '../../prepareQueryObjects';
import { formatQuery } from '../formatQuery';
import { query, queryForNumberParsing, queryWithValueSourceField } from '../formatQueryTestUtils';
import {
  bigIntJsonParseReviver,
  bigIntJsonStringifyReplacer,
  getQuoteFieldNamesWithArray,
} from '../utils';

it('formats JSON correctly', () => {
  expect(formatQuery(query)).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(query, {})).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(query, 'json')).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(queryWithValueSourceField)).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
  expect(formatQuery(queryWithValueSourceField, {})).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
  expect(formatQuery(queryWithValueSourceField, 'json')).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
});

it('handles invalid type correctly', () => {
  // @ts-expect-error 'null' is not a valid format
  expect(formatQuery(query, 'null')).toBe('');
});

it('handles json_without_ids correctly', () => {
  const queryToTest: RuleGroupType<RuleType & { extraProperty: string }> & {
    extraProperty: string;
  } = {
    id: 'root',
    combinator: 'and',
    rules: [
      {
        id: 'inner',
        field: 'firstName',
        value: '',
        operator: 'null',
        valueSource: 'value',
        extraProperty: 'extraProperty',
      },
    ],
    not: false,
    extraProperty: 'extraProperty',
  };
  const expectedResult = JSON.parse(
    '{"rules":[{"field":"firstName","value":"","operator":"null","valueSource":"value","extraProperty":"extraProperty"}],"combinator":"and","not":false,"extraProperty":"extraProperty"}'
  );
  expect(JSON.parse(formatQuery(prepareRuleGroup(queryToTest), 'json_without_ids'))).toEqual(
    expectedResult
  );
});

describe('parseNumbers', () => {
  it('parses numbers for json', () => {
    const allNumbersParsed = `{
  "combinator": "and",
  "rules": [
    {
      "field": "f",
      "operator": ">",
      "value": "NaN"
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "combinator": "or",
      "rules": [
        {
          "field": "f",
          "operator": "<",
          "value": 1.5
        },
        {
          "field": "f",
          "operator": ">",
          "value": 1.5
        }
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": [
        0,
        1,
        2
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": [
        0,
        1,
        2
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": "0, abc, 2"
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        0,
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        0,
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": "0, abc"
    },
    {
      "field": "f",
      "operator": "between",
      "value": 1
    },
    {
      "field": "f",
      "operator": "between",
      "value": 1
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        {},
        {}
      ]
    }
  ]
}`;
    for (const opts of [
      { parseNumbers: true },
      { parseNumbers: 'strict' },
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ] as FormatQueryOptions[]) {
      expect(formatQuery(queryForNumberParsing, { ...opts, format: 'json' })).toBe(
        allNumbersParsed
      );
    }
  });

  it('parses numbers for json_without_ids', () => {
    const allNumbersParsed = JSON.parse(
      '{"rules":[{"field":"f","value":"NaN","operator":">"},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"rules":[{"field":"f","value":1.5,"operator":"<"},{"field":"f","value":1.5,"operator":">"}],"combinator":"or"},{"field":"f","value":[0,1,2],"operator":"in"},{"field":"f","value":[0,1,2],"operator":"in"},{"field":"f","value":"0, abc, 2","operator":"in"},{"field":"f","value":[0,1],"operator":"between"},{"field":"f","value":[0,1],"operator":"between"},{"field":"f","value":"0, abc","operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":[1],"operator":"between"},{"field":"f","value":[{},{}],"operator":"between"}],"combinator":"and"}'
    );
    for (const opts of [
      { parseNumbers: true },
      { parseNumbers: 'strict' },
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ] as FormatQueryOptions[]) {
      expect(
        JSON.parse(
          formatQuery(prepareRuleGroup(queryForNumberParsing), {
            ...opts,
            format: 'json_without_ids',
          })
        )
      ).toEqual(allNumbersParsed);
    }
  });

  it('parses numbers for json_without_ids with independentCombinators', () => {
    const allNumbersParsed = JSON.parse(
      '{"rules":[{"field":"f","value":"NaN","operator":">"},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"rules":[{"field":"f","value":1.5,"operator":"<"},"or",{"field":"f","value":1.5,"operator":">"}]},"and",{"field":"f","value":[0,1,2],"operator":"in"},"and",{"field":"f","value":[0,1,2],"operator":"in"},"and",{"field":"f","value":"0, abc, 2","operator":"in"},"and",{"field":"f","value":[0,1],"operator":"between"},"and",{"field":"f","value":[0,1],"operator":"between"},"and",{"field":"f","value":"0, abc","operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":[1],"operator":"between"},"and",{"field":"f","value":[{},{}],"operator":"between"}]}'
    );
    for (const opts of [
      { parseNumbers: true },
      { parseNumbers: 'strict' },
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ] as FormatQueryOptions[]) {
      expect(
        JSON.parse(
          formatQuery(prepareRuleGroup(convertToIC(queryForNumberParsing)), {
            ...opts,
            format: 'json_without_ids',
          })
        )
      ).toEqual(allNumbersParsed);
    }
  });

  it('parses numbers only when inputType is number', () => {
    expect(
      JSON.parse(
        formatQuery(
          {
            rules: [
              { field: 'f1', operator: '=', value: '123' },
              'and',
              { field: 'f2', operator: '=', value: '123' },
            ],
          },
          {
            format: 'json_without_ids',
            parseNumbers: 'strict-limited',
            fields: [
              { name: 'f1', label: 'f1', inputType: 'number' },
              { name: 'f2', label: 'f2' },
            ],
          }
        )
      )
    ).toEqual(
      JSON.parse(
        '{"rules":[{"field":"f1","operator":"=","value":123},"and",{"field":"f2","operator":"=","value":"123"}]}'
      )
    );
  });
});

it('quoteFieldNamesWithArray handles null', () => {
  expect(getQuoteFieldNamesWithArray(null)).toEqual(['', '']);
});

it('handles custom ruleGroupProcessor correctly', () => {
  expect(formatQuery(query, { ruleGroupProcessor: () => '' })).toBe('');
});

describe('JSON.stringify/parse utils', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f', operator: '=', value: 1214n }],
  };
  const queryAsString = `{"combinator":"and","rules":[{"field":"f","operator":"=","value":{"$bigint":"1214"}}]}`;

  it('stringifies bigints correctly', () => {
    expect(JSON.stringify(query, bigIntJsonStringifyReplacer)).toMatch(
      `"value":{"$bigint":"1214"}`
    );
  });
  it('parses bigints correctly', () => {
    expect(JSON.parse(queryAsString, bigIntJsonParseReviver)).toEqual(query);
  });
});
