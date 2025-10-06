import type { FormatQueryOptions, RuleGroupType, RuleGroupTypeIC, RuleType } from '../../../types';
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
  it.each([
    ['true', { parseNumbers: true }],
    ['strict', { parseNumbers: 'strict' }],
    [
      'strict-limited',
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ],
  ] satisfies [string, FormatQueryOptions][])('parses numbers for json (%s)', (_, opts) => {
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
    expect(formatQuery(queryForNumberParsing, { ...opts, format: 'json' })).toBe(allNumbersParsed);
  });

  it.each([
    ['true', { parseNumbers: true }],
    ['strict', { parseNumbers: 'strict' }],
    [
      'strict-limited',
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ],
  ] satisfies [string, FormatQueryOptions][])(
    'parses numbers for json_without_ids (%s)',
    (_, opts) => {
      const allNumbersParsed = JSON.parse(
        '{"rules":[{"field":"f","value":"NaN","operator":">"},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"rules":[{"field":"f","value":1.5,"operator":"<"},{"field":"f","value":1.5,"operator":">"}],"combinator":"or"},{"field":"f","value":[0,1,2],"operator":"in"},{"field":"f","value":[0,1,2],"operator":"in"},{"field":"f","value":"0, abc, 2","operator":"in"},{"field":"f","value":[0,1],"operator":"between"},{"field":"f","value":[0,1],"operator":"between"},{"field":"f","value":"0, abc","operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":[1],"operator":"between"},{"field":"f","value":[{},{}],"operator":"between"}],"combinator":"and"}'
      );
      expect(
        JSON.parse(
          formatQuery(prepareRuleGroup(queryForNumberParsing), {
            ...opts,
            format: 'json_without_ids',
          })
        )
      ).toEqual(allNumbersParsed);
    }
  );

  it.each([
    ['true', { parseNumbers: true }],
    ['strict', { parseNumbers: 'strict' }],
    [
      'strict-limited',
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ],
  ] satisfies [string, FormatQueryOptions][])(
    'parses numbers for json_without_ids with independentCombinators (%s)',
    (_, opts) => {
      const allNumbersParsed = JSON.parse(
        '{"rules":[{"field":"f","value":"NaN","operator":">"},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"rules":[{"field":"f","value":1.5,"operator":"<"},"or",{"field":"f","value":1.5,"operator":">"}]},"and",{"field":"f","value":[0,1,2],"operator":"in"},"and",{"field":"f","value":[0,1,2],"operator":"in"},"and",{"field":"f","value":"0, abc, 2","operator":"in"},"and",{"field":"f","value":[0,1],"operator":"between"},"and",{"field":"f","value":[0,1],"operator":"between"},"and",{"field":"f","value":"0, abc","operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":[1],"operator":"between"},"and",{"field":"f","value":[{},{}],"operator":"between"}]}'
      );
      expect(
        JSON.parse(
          formatQuery(prepareRuleGroup(convertToIC(queryForNumberParsing)), {
            ...opts,
            format: 'json_without_ids',
          })
        )
      ).toEqual(allNumbersParsed);
    }
  );

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

describe('muted independent combinator handling', () => {
  it('filters muted items in IC format', () => {
    const queryIC: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        { field: 'f2', operator: '=', value: 'v2', muted: true },
        'or',
        { field: 'f3', operator: '=', value: 'v3' },
      ],
    };

    const sql = formatQuery(queryIC, 'sql');
    expect(sql).toEqual("(f1 = 'v1' or f3 = 'v3')");
  });

  it('handles muted IC groups', () => {
    const queryIC: RuleGroupTypeIC = {
      muted: true,
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        { field: 'f2', operator: '=', value: 'v2' },
      ],
    };

    const sql = formatQuery(queryIC, 'sql');
    expect(sql).toBe('(1 = 1)'); // Muted top-level group returns fallback expression
  });

  it('handles nested muted IC groups', () => {
    const queryIC: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        {
          muted: true,
          rules: [
            { field: 'f2', operator: '=', value: 'v2' },
            'or',
            { field: 'f3', operator: '=', value: 'v3' },
          ],
        },
      ],
    };

    const sql = formatQuery(queryIC, 'sql');
    expect(sql).toEqual("(f1 = 'v1')");
  });

  it('handles trailing combinator after muted items', () => {
    // Tests cleaning up trailing combinators when all remaining rules are muted
    const queryIC: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        { field: 'f2', operator: '=', value: 'v2', muted: true },
        'or',
        { field: 'f3', operator: '=', value: 'v3', muted: true },
      ],
    };

    const sql = formatQuery(queryIC, 'sql');
    expect(sql).toBe("(f1 = 'v1')");
  });

  it('handles muted top-level groups', () => {
    // Tests that muted groups are handled correctly in different formats
    const queryWithMutedGroup = {
      combinator: 'and',
      muted: true,
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        {
          combinator: 'or',
          rules: [{ field: 'f2', operator: '=', value: 'v2' }],
        },
      ],
    };

    const sql = formatQuery(queryWithMutedGroup, 'sql');
    expect(sql).toBe('(1 = 1)'); // Muted top-level group returns fallback expression

    // JSON format preserves the structure including muted property
    const json = JSON.parse(formatQuery(queryWithMutedGroup, 'json'));
    expect(json.muted).toBe(true);
    expect(json.rules).toHaveLength(2);
  });

  it('handles IC query ending with combinator after all rules are muted', () => {
    // Tests when all rules after a combinator are muted, leaving a trailing combinator
    const queryIC: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        { field: 'f2', operator: '=', value: 'v2', muted: true },
      ],
    };

    const sql = formatQuery(queryIC, 'sql');
    expect(sql).toBe("(f1 = 'v1')");
  });

  it('removes trailing combinator in IC format', () => {
    // Tests removal of trailing combinators in independent combinator format
    // when unmuted items are followed by a combinator with no subsequent unmuted items
    const queryIC: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        { field: 'f2', operator: '=', value: 'v2' },
        'or',
        // Everything after this combinator is muted, so 'or' becomes trailing
      ] as unknown as RuleGroupTypeIC['rules'],
    };

    // The 'or' combinator at the end should be removed
    const sql = formatQuery(queryIC, 'sql');
    expect(sql).toBe("(f1 = 'v1' and f2 = 'v2')");

    // Another case: combinator at the very end with no rules after it
    const queryIC2: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
      ] as unknown as RuleGroupTypeIC['rules'],
    };

    const sql2 = formatQuery(queryIC2, 'sql');
    expect(sql2).toBe("(f1 = 'v1')");
  });

  it('tests all branches of IC combinator removal logic', () => {
    // Tests all combinations of combinator removal conditions in IC format

    // Case 1: Standard format (has combinator) - should not remove preceding combinator
    const standardQuery = {
      combinator: 'and',
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        { field: 'f2', operator: '=', value: 'v2', muted: true },
      ],
    };
    const sql1 = formatQuery(standardQuery, 'sql');
    expect(sql1).toBe("(f1 = 'v1')");

    // Case 2: IC format but no preceding combinator (first rule is muted)
    const icQueryNoPrecedingCombinator: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1', muted: true },
        'and',
        { field: 'f2', operator: '=', value: 'v2' },
      ],
    };
    const sql2 = formatQuery(icQueryNoPrecedingCombinator, 'sql');
    // When the first rule is muted, the following combinator should also be removed
    expect(sql2).toBe("(f2 = 'v2')");

    // Case 3: IC format with empty filteredRules (shouldn't happen but tests the condition)
    const icQueryEmpty: RuleGroupTypeIC = {
      rules: [{ field: 'f1', operator: '=', value: 'v1', muted: true }],
    };
    const sql3 = formatQuery(icQueryEmpty, 'sql');
    expect(sql3).toBe('(1 = 1)'); // Empty query returns fallback expression

    // Case 4: IC format with combinator not immediately preceding muted item
    const icQueryCombinatorNotPreceding: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'and',
        { field: 'f2', operator: '=', value: 'v2' },
        { field: 'f3', operator: '=', value: 'v3', muted: true }, // No combinator before this
      ] as unknown as RuleGroupTypeIC['rules'],
    };
    const sql4 = formatQuery(icQueryCombinatorNotPreceding, 'sql');
    expect(sql4).toBe("(f1 = 'v1' and f2 = 'v2')");
  });
});
