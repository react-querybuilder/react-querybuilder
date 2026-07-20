import * as dz from 'drizzle-orm';
import type { ExpressionNode } from '../types';
import { serializeDrizzle } from './serializeDrizzle';
import { serializeInfix, quoteLeaf } from './serializeInfix';
import { serializeMongoAgg } from './serializeMongoAgg';
import { serializeTanStackDb } from './serializeTanStackDb';

const field = (f: string): ExpressionNode => ({ kind: 'field', field: f });
const fn = (name: string, ...args: ExpressionNode[]): ExpressionNode => ({
  kind: 'func',
  fn: name,
  args,
});

describe('serialize util defensive branches', () => {
  it('serializeInfix throws for unknown function', () => {
    expect(() =>
      serializeInfix(
        fn('bogus', field('a')),
        {},
        { renderField: f => f, renderLeaf: n => `${n.value}` }
      )
    ).toThrow('No serializer for expression function "bogus"');
  });

  it('serializeMongoAgg supports operator-name (string) serializers and throws for unknown', () => {
    // String serializer form: `{ [op]: args }`.
    const out = serializeMongoAgg(fn('add', field('a'), field('b')), { add: '$add' });
    expect(out).toEqual({ $add: ['$a', '$b'] });
    expect(() => serializeMongoAgg(fn('bogus', field('a')), {})).toThrow(
      'No "mongodb" serializer for expression function "bogus"'
    );
  });

  it('serializeDrizzle throws for missing column and unknown function', () => {
    const ctx = { sql: dz.sql, columns: {} as Record<string, unknown> };
    expect(() => serializeDrizzle(field('missing'), {}, ctx)).toThrow(
      'No Drizzle column for expression field "missing"'
    );
    const ctx2 = { sql: dz.sql, columns: { a: dz.sql`a` } };
    expect(() => serializeDrizzle(fn('bogus', field('a')), {}, ctx2)).toThrow(
      'No "drizzle" serializer for expression function "bogus"'
    );
  });

  it('serializeTanStackDb throws for unknown function', () => {
    const ctx = { ops: {}, resolveField: (f: string) => f };
    expect(() => serializeTanStackDb(fn('bogus', field('a')), {}, ctx)).toThrow(
      'No "tanstack_db" serializer for expression function "bogus"'
    );
  });

  it('quoteLeaf renders numeric/boolean/bigint leaves bare and strings quoted', () => {
    expect(quoteLeaf({ kind: 'value', value: true }, `'`, {})).toBe('true');
    expect(quoteLeaf({ kind: 'value', value: 10n }, `'`, {})).toBe('10');
    expect(quoteLeaf({ kind: 'value', value: 'a', valueType: 'text' }, `'`, {})).toBe(`'a'`);
  });

  it('serializeDrizzle coerces numeric value leaves when parseNumbers is set', () => {
    const ctx = { sql: dz.sql, columns: {} as Record<string, unknown> };
    expect(serializeDrizzle({ kind: 'value', value: '5' }, {}, ctx, { parseNumbers: true })).toBe(
      5
    );
  });

  it('serializeTanStackDb resolves dotted and bare fields', () => {
    const ctx = { ops: {}, resolveField: (f: string) => `resolved:${f}` };
    expect(serializeTanStackDb(field('todo.name'), {}, ctx)).toBe('resolved:todo.name');
    expect(serializeTanStackDb(field('name'), {}, ctx)).toBe('resolved:name');
    // value leaves: with and without parseNumbers coercion.
    expect(
      serializeTanStackDb({ kind: 'value', value: '5' }, {}, ctx, { parseNumbers: true })
    ).toBe(5);
    expect(serializeTanStackDb({ kind: 'value', value: '5' }, {}, ctx)).toBe('5');
  });
});
