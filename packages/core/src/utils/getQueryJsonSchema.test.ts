import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import type { FullField, JSONSchema, RuleGroupType, RuleGroupTypeIC } from '../types';
import { formatQuery } from './formatQuery';
import type { GetQueryJsonSchemaOptions } from './getQueryJsonSchema';
import { getQueryJsonSchema } from './getQueryJsonSchema';

const fields: FullField[] = [
  { name: 'firstName', value: 'firstName', label: 'First Name' },
  { name: 'lastName', value: 'lastName', label: 'lastName', operators: ['=', '!='] },
  { name: 'age', value: 'age', label: 'Age', inputType: 'number' },
  { name: 'dob', value: 'dob', label: 'DOB', inputType: 'date', operators: ['=', 'between'] },
  {
    name: 'color',
    value: 'color',
    label: 'Color',
    valueEditorType: 'select',
    values: [
      { name: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' },
    ],
    operators: ['=', 'in', 'null'],
  },
  {
    name: 'tags',
    value: 'tags',
    label: 'Tags',
    valueEditorType: 'multiselect',
    values: [
      {
        label: 'G',
        options: [
          { name: 'a', label: 'A' },
          { name: 'b', label: 'B' },
        ],
      },
    ],
    operators: [{ name: '=', label: '=' }],
  },
  { name: 'isMember', value: 'isMember', label: 'Member', valueEditorType: 'checkbox' },
  { name: 'active', value: 'active', label: 'Active', valueEditorType: () => 'switch' },
  {
    name: 'nickname',
    value: 'nickname',
    label: 'Nickname',
    valueSources: ['value', 'field'],
    comparator: 'group',
    group: 'names',
    operators: ['=', 'in'],
  },
  {
    name: 'alias',
    value: 'alias',
    label: 'Alias',
    group: 'names',
    valueSources: () => ['field'],
    operators: ['='],
  },
];

const ajvs = [new Ajv({ strict: false }), new Ajv2020({ strict: false })];
const validate = (schema: JSONSchema, data: unknown) => ajvs.map(a => a.validate(schema, data));
const expectValid = (schema: JSONSchema, data: unknown) =>
  expect(validate(schema, data)).toEqual([true, true]);
const expectInvalid = (schema: JSONSchema, data: unknown) =>
  expect(validate(schema, data)).toEqual([false, false]);

const allowedKeywords = new Set([
  '$schema',
  '$ref',
  '$defs',
  'type',
  'description',
  'enum',
  'anyOf',
  'properties',
  'required',
  'additionalProperties',
  'items',
  'minItems',
  'maxItems',
]);

// Walks every subschema
const walk = (s: JSONSchema, fn: (s: JSONSchema) => void) => {
  fn(s);
  for (const sub of [
    ...Object.values(s.$defs ?? {}),
    ...Object.values(s.properties ?? {}),
    ...(s.anyOf ?? []),
    ...(s.items ? [s.items] : []),
  ]) {
    walk(sub, fn);
  }
};

const validQuery: RuleGroupType = {
  combinator: 'and',
  not: false,
  rules: [
    { field: 'firstName', operator: 'contains', value: 'Jo' },
    { field: 'lastName', operator: '!=', value: 'Smith' },
    { field: 'age', operator: '>', value: 21 },
    { field: 'age', operator: 'between', value: [1, 2] },
    { field: 'dob', operator: 'between', value: ['2020-01-01', '2021-01-01'] },
    { field: 'color', operator: 'in', value: ['red', 'blue'] },
    { field: 'color', operator: 'null', value: '' },
    { field: 'color', operator: 'null' } as RuleGroupType['rules'][number],
    { field: 'tags', operator: '=', value: ['a', 'b'] },
    { field: 'isMember', operator: '=', value: true },
    { field: 'active', operator: '=', value: false },
    { field: 'nickname', operator: '=', value: 'Bob' },
    { field: 'nickname', operator: '=', valueSource: 'value', value: 'Bob' },
    { field: 'nickname', operator: '=', valueSource: 'field', value: 'alias' },
    { field: 'nickname', operator: 'in', valueSource: 'field', value: ['alias'] },
    { field: 'alias', operator: '=', valueSource: 'field', value: 'nickname' },
    { combinator: 'or', rules: [{ field: 'age', operator: '=', value: 3 }] },
  ],
};

const invalidRules = [
  { field: 'nope', operator: '=', value: 'x' },
  { field: 'lastName', operator: 'contains', value: 'x' },
  { field: 'age', operator: '=', value: 'x' },
  { field: 'age', operator: 'between', value: [1] },
  { field: 'age', operator: 'between', value: [1, 2, 3] },
  { field: 'color', operator: '=', value: 'green' },
  { field: 'tags', operator: '=', value: 'a' },
  { field: 'isMember', operator: '=', value: 'yes' },
  { field: 'nickname', operator: '=', valueSource: 'field', value: 'firstName' },
  { field: 'alias', operator: '=', value: 'x' },
  { field: 'firstName', operator: '=' },
];

describe('getQueryJsonSchema', () => {
  it('generates default schema', () => {
    const schema = getQueryJsonSchema(fields);
    expect(schema.$ref).toBe('#/$defs/group');
    expect(schema.$schema).toBeUndefined();
    expect(schema.$defs?.group).toEqual({
      type: 'object',
      properties: {
        combinator: { type: 'string', enum: ['and', 'or'] },
        not: { type: 'boolean' },
        rules: {
          type: 'array',
          items: { anyOf: [{ $ref: '#/$defs/rule' }, { $ref: '#/$defs/group' }] },
        },
      },
      required: ['combinator', 'rules'],
    });
    expect(schema.$defs?.rule.anyOf?.length).toBeGreaterThan(fields.length);
  });

  it('validates valid query, round-trips through formatQuery', () => {
    const schema = getQueryJsonSchema(fields);
    expectValid(schema, validQuery);
    expect(() => formatQuery(validQuery, { format: 'sql', fields })).not.toThrow();
  });

  it.each(invalidRules)('rejects invalid rule %j', rule => {
    expectInvalid(getQueryJsonSchema(fields), { combinator: 'and', rules: [rule] });
  });

  it('diagnostics flag what the schema rejects', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'nope', operator: '=', value: 'x' },
        { field: 'lastName', operator: 'contains', value: 'x' },
        { field: 'age', operator: '=', value: 'x' },
        { field: 'age', operator: 'between', value: [1] },
        { field: 'color', operator: '=', value: 'green' },
        { field: 'isMember', operator: '=', value: 'yes' },
      ],
    };
    const { diagnostics } = formatQuery(query, { format: 'diagnostics', fields });
    expect(diagnostics.filter(d => d.code !== 'UNREFERENCED_FIELD').map(d => d.path[0])).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
    expect(formatQuery(validQuery, { format: 'diagnostics', fields }).diagnostics).toEqual(
      expect.not.arrayContaining([expect.objectContaining({ source: 'type-check' })])
    );
  });

  it('rejects bad combinator/missing rules', () => {
    const schema = getQueryJsonSchema(fields);
    expectInvalid(schema, { combinator: 'xor', rules: [] });
    expectInvalid(schema, { combinator: 'and' });
  });

  it('uses only dialect-safe keywords in all modes', () => {
    const opts: GetQueryJsonSchemaOptions[] = [
      {},
      { strict: true },
      { mode: 'loose' },
      { mode: 'loose', strict: true },
      { queryType: 'ic' },
      { queryType: 'ic', strict: true, maxDepth: 2 },
      { includeIds: true, includeSchemaDeclaration: true },
      { listsAsArrays: false },
    ];
    for (const o of opts) {
      const schema = getQueryJsonSchema(fields, o);
      walk(schema, s => {
        for (const k of Object.keys(s)) expect(allowedKeywords).toContain(k);
      });
      const { $schema: _, ...noDecl } = schema;
      expect(() => ajvs[0].compile(schema)).not.toThrow();
      expect(() => ajvs[1].compile(noDecl)).not.toThrow();
    }
  });

  it('strict mode', () => {
    const schema = getQueryJsonSchema(fields, { strict: true, includeIds: true });
    expect(schema.type).toBe('object');
    expect(schema.$ref).toBeUndefined();
    const objs: JSONSchema[] = [];
    walk(schema, s => {
      if (s.type === 'object') objs.push(s);
    });
    expect(objs.length).toBeGreaterThan(0);
    for (const s of objs) {
      expect(s.additionalProperties).toBe(false);
      expect(s.required).toEqual(Object.keys(s.properties!));
    }
    expectValid(schema, {
      id: null,
      path: null,
      combinator: 'and',
      not: null,
      rules: [
        { id: null, path: null, field: 'nickname', operator: '=', valueSource: null, value: 'x' },
        { id: 'a', path: [0, 1], field: 'color', operator: 'null', value: null },
      ],
    });
    // extra props rejected
    expectInvalid(schema, { id: null, path: null, combinator: 'and', not: null, rules: [], x: 1 });
  });

  it('numeric maxDepth inlines', () => {
    const schema = getQueryJsonSchema(fields, { maxDepth: 1 });
    expect(schema.$defs).toBeUndefined();
    expect(JSON.stringify(schema)).not.toContain('$ref');
    const rule = { field: 'age', operator: '=', value: 1 };
    expectValid(schema, { combinator: 'and', rules: [{ combinator: 'or', rules: [rule] }] });
    expectInvalid(schema, {
      combinator: 'and',
      rules: [{ combinator: 'or', rules: [{ combinator: 'or', rules: [rule] }] }],
    });
    expect(getQueryJsonSchema(fields, { maxDepth: -1 })).toEqual(
      getQueryJsonSchema(fields, { maxDepth: 0 })
    );
  });

  it('IC', () => {
    const schema = getQueryJsonSchema(fields, { queryType: 'ic' });
    const q: RuleGroupTypeIC = {
      rules: [
        { field: 'age', operator: '=', value: 1 },
        'and',
        { rules: [{ field: 'age', operator: '=', value: 2 }] },
      ],
    };
    expectValid(schema, q);
    const icCodes = (query: unknown) =>
      formatQuery(query as RuleGroupTypeIC, { format: 'diagnostics', fields })
        .diagnostics.map(d => d.code)
        .filter(c => c === 'INVALID_STRUCTURE');
    expect(icCodes(q)).toEqual([]);
    // alternation not enforced by schema; caught by diagnostics
    const broken = { rules: ['and', 'or'] };
    expectValid(schema, broken);
    expect(icCodes(broken)).toEqual(['INVALID_STRUCTURE']);
    expectInvalid(schema, { rules: ['xor'] });
  });

  it('loose mode', () => {
    const schema = getQueryJsonSchema(fields, { mode: 'loose' });
    expect(schema.$defs?.rule).toEqual({
      type: 'object',
      properties: {
        field: {
          type: 'string',
          enum: [
            'firstName',
            'lastName',
            'age',
            'dob',
            'color',
            'tags',
            'isMember',
            'active',
            'nickname',
            'alias',
          ],
        },
        operator: {
          type: 'string',
          enum: [
            '=',
            '!=',
            '<',
            '>',
            '<=',
            '>=',
            'contains',
            'beginsWith',
            'endsWith',
            'doesNotContain',
            'doesNotBeginWith',
            'doesNotEndWith',
            'null',
            'notNull',
            'in',
            'notIn',
            'between',
            'notBetween',
          ],
        },
        value: {},
        valueSource: { type: 'string', enum: ['value', 'field'] },
      },
      required: ['field', 'operator', 'value'],
    });
    expectValid(schema, {
      combinator: 'and',
      rules: [{ field: 'age', operator: 'in', value: 'x' }],
    });
    expectInvalid(schema, { combinator: 'and', rules: [{ field: 'x', operator: '=', value: 1 }] });
    const strictLoose = getQueryJsonSchema([{ name: 'a', label: 'A' }], {
      mode: 'loose',
      strict: true,
    });
    expect(strictLoose.$defs?.rule.properties?.valueSource).toBeUndefined();
    expect(strictLoose.$defs?.rule.properties?.value.anyOf).toBeDefined();
  });

  it('empty fields falls back to loose w/ string field', () => {
    const schema = getQueryJsonSchema([], { operators: ['=', '!='] });
    expect(schema.$defs?.rule.properties?.field).toEqual({ type: 'string' });
    expect(schema.$defs?.rule.properties?.operator.enum).toEqual(['=', '!=']);
  });

  it('single branch rule, no not, custom combinators, no descriptions', () => {
    const schema = getQueryJsonSchema([{ name: 'f', label: 'F', operators: ['='] }], {
      includeNot: false,
      combinators: ['all', 'any'],
      descriptions: false,
    });
    const rule = schema.$defs!.rule;
    expect(rule.anyOf).toBeUndefined();
    expect(rule.description).toBeUndefined();
    expect(schema.$defs?.group.properties?.not).toBeUndefined();
    expect(schema.$defs?.group.properties?.combinator.enum).toEqual(['all', 'any']);
  });

  it('object-map fields, optgroup fields', () => {
    const fromMap = getQueryJsonSchema({
      b: { name: 'b', label: 'B' },
      a: { name: 'a', label: 'A' },
    });
    expect(fromMap.$defs?.rule.anyOf?.map(b => b.properties?.field.enum?.[0])).toContain('a');
    const fromGroups = getQueryJsonSchema([
      { label: 'G', options: [{ name: 'x', label: 'X', operators: ['='] }] },
    ]);
    expect(fromGroups.$defs?.rule.properties?.field.enum).toEqual(['x']);
  });

  it('listsAsArrays: false', () => {
    const schema = getQueryJsonSchema(fields, { listsAsArrays: false });
    expectValid(schema, {
      combinator: 'and',
      rules: [
        { field: 'age', operator: 'between', value: '1,2' },
        { field: 'color', operator: 'in', value: 'red,blue' },
        { field: 'tags', operator: '=', value: 'a,b' },
      ],
    });
    expectInvalid(schema, {
      combinator: 'and',
      rules: [{ field: 'age', operator: 'between', value: [1, 2] }],
    });
  });

  it('allowFieldValueSource', () => {
    const forced = getQueryJsonSchema(fields, { allowFieldValueSource: true });
    expectValid(forced, {
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', valueSource: 'field', value: 'lastName' }],
    });
    const none = getQueryJsonSchema(fields, { allowFieldValueSource: false });
    expectInvalid(none, {
      combinator: 'and',
      rules: [{ field: 'nickname', operator: '=', valueSource: 'field', value: 'alias' }],
    });
    // field-only source stripped -> falls back to 'value'
    expectValid(none, {
      combinator: 'and',
      rules: [{ field: 'alias', operator: '=', value: 'x' }],
    });
  });

  it('field source w/ no comparable fields is omitted; no branches -> loose rule', () => {
    const get = (opts?: GetQueryJsonSchemaOptions) =>
      getQueryJsonSchema(
        [
          {
            name: 'a',
            label: 'A',
            valueSources: ['field'],
            comparator: () => false,
            operators: ['='],
          },
        ],
        opts
      );
    const schema = get();
    expect(schema.$defs?.rule.anyOf).toBeUndefined();
    expect(schema.$defs?.rule).toEqual(get({ mode: 'loose' }).$defs?.rule);
  });

  it('operator arity, text editor w/ values, time hints', () => {
    const schema = getQueryJsonSchema([
      {
        name: 'a',
        label: 'A',
        operators: [
          { name: 'isEmpty', label: 'empty', arity: 'unary' },
          { name: 'isZero', label: 'zero', arity: 1 },
          { name: 'eq', label: 'eq', arity: 2 },
        ],
        valueEditorType: 'text',
        values: [{ name: 'x', label: 'X' }],
        inputType: 'time',
      },
    ]);
    const [unary, binary] = schema.$defs!.rule.anyOf!;
    expect(unary.properties?.operator.enum).toEqual(['isEmpty', 'isZero']);
    expect(binary.properties?.value).toEqual({ type: 'string', description: 'Time (HH:mm)' });
  });

  it('includeSchemaDeclaration', () => {
    expect(getQueryJsonSchema(fields, { includeSchemaDeclaration: true }).$schema).toBe(
      'http://json-schema.org/draft-07/schema#'
    );
    expect(
      getQueryJsonSchema(fields, { includeSchemaDeclaration: true, maxDepth: 0 }).$schema
    ).toBeDefined();
  });
});
