import * as dz from 'drizzle-orm';
import type { SQLSerializerRegistry } from '../types';
import { resolvePresetSerializer } from '../utils/resolvePresetSerializer';
import { defaultCELSerializers } from './cel';
import { defaultCypherSerializers } from './cypher';
import { defaultDrizzleSerializers } from './drizzle';
import { defaultJSONataSerializers } from './jsonata';
import { defaultMongoDBSerializers } from './mongodb';
import { defaultNLSerializers } from './nl';
import { defaultPainlessSerializers } from './painless';
import { defaultSPARQLSerializers } from './sparql';
import { defaultSpELSerializers } from './spel';
import { defaultTanStackDbSerializers } from './tanstackDb';

// Exercise every serializer of each string registry directly (opts-first, string operands).
describe.each([
  ['cel', defaultCELSerializers],
  ['spel', defaultSpELSerializers],
  ['cypher', defaultCypherSerializers],
  ['sparql', defaultSPARQLSerializers],
  ['jsonata', defaultJSONataSerializers],
  ['painless', defaultPainlessSerializers],
  ['nl', defaultNLSerializers],
] as [string, SQLSerializerRegistry][])('%s string serializers', (_name, reg) => {
  it('serializes every built-in function', () => {
    const o = {};
    const call = (key: string, ...args: string[]) => resolvePresetSerializer(reg[key])(o, ...args);
    expect(call('add', 'a', 'b')).toBeTruthy();
    expect(call('subtract', 'a', 'b')).toBeTruthy();
    expect(call('multiply', 'a', 'b')).toBeTruthy();
    expect(call('divide', 'a', 'b')).toBeTruthy();
    expect(call('mod', 'a', 'b')).toBeTruthy();
    expect(call('abs', 'x')).toBeTruthy();
    expect(call('min', 'a', 'b')).toBeTruthy();
    expect(call('max', 'a', 'b')).toBeTruthy();
    expect(call('upper', 'x')).toBeTruthy();
    expect(call('lower', 'x')).toBeTruthy();
  });
});

describe('mongodb aggregation serializers', () => {
  it('serializes every built-in function', () => {
    const r = defaultMongoDBSerializers;
    const o = {};
    // Registry entries are typed as `string | fn`; every built-in here is a function.
    const fn = (s: (typeof r)[string]) => s as (o: object, ...a: unknown[]) => unknown;
    expect(fn(r.add)(o, '$a', '$b')).toEqual({ $add: ['$a', '$b'] });
    expect(fn(r.subtract)(o, '$a', '$b')).toEqual({ $subtract: ['$a', '$b'] });
    expect(fn(r.multiply)(o, '$a', '$b')).toEqual({ $multiply: ['$a', '$b'] });
    expect(fn(r.divide)(o, '$a', '$b')).toEqual({ $divide: ['$a', '$b'] });
    expect(fn(r.min)(o, '$a', '$b')).toEqual({ $min: ['$a', '$b'] });
    expect(fn(r.max)(o, '$a', '$b')).toEqual({ $max: ['$a', '$b'] });
    expect(fn(r.abs)(o, '$x')).toEqual({ $abs: '$x' });
    expect(fn(r.mod)(o, '$a', '$b')).toEqual({ $mod: ['$a', '$b'] });
    expect(fn(r.upper)(o, '$x')).toEqual({ $toUpper: '$x' });
    expect(fn(r.lower)(o, '$x')).toEqual({ $toLower: '$x' });
  });
});

describe('drizzle serializers', () => {
  it('serializes every built-in function', () => {
    const r = defaultDrizzleSerializers;
    const o = {};
    for (const key of ['add', 'subtract', 'multiply', 'divide', 'mod'] as const) {
      expect(r[key](dz.sql, o, dz.sql`a`, dz.sql`b`)).toBeDefined();
    }
    expect(r.abs(dz.sql, o, dz.sql`x`)).toBeDefined();
    expect(r.upper(dz.sql, o, dz.sql`x`)).toBeDefined();
    expect(r.lower(dz.sql, o, dz.sql`x`)).toBeDefined();
    // min/max cover both non-sqlite (least/greatest) and sqlite (min/max) presets.
    expect(r.min(dz.sql, {}, dz.sql`a`, dz.sql`b`)).toBeDefined();
    expect(r.min(dz.sql, { preset: 'sqlite' }, dz.sql`a`, dz.sql`b`)).toBeDefined();
    expect(r.max(dz.sql, {}, dz.sql`a`, dz.sql`b`)).toBeDefined();
    expect(r.max(dz.sql, { preset: 'sqlite' }, dz.sql`a`, dz.sql`b`)).toBeDefined();
  });
});

describe('tanstack_db serializers', () => {
  it('serializes every built-in function', () => {
    const r = defaultTanStackDbSerializers;
    const ops = {
      add: (a: unknown, b: unknown) => ['add', a, b],
      subtract: (a: unknown, b: unknown) => ['subtract', a, b],
      multiply: (a: unknown, b: unknown) => ['multiply', a, b],
      divide: (a: unknown, b: unknown) => ['divide', a, b],
      upper: (x: unknown) => ['upper', x],
      lower: (x: unknown) => ['lower', x],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const o = {};
    expect(r.add(ops, o, 'a', 'b')).toEqual(['add', 'a', 'b']);
    expect(r.subtract(ops, o, 'a', 'b')).toEqual(['subtract', 'a', 'b']);
    expect(r.multiply(ops, o, 'a', 'b')).toEqual(['multiply', 'a', 'b']);
    expect(r.divide(ops, o, 'a', 'b')).toEqual(['divide', 'a', 'b']);
    expect(r.upper(ops, o, 'x')).toEqual(['upper', 'x']);
    expect(r.lower(ops, o, 'x')).toEqual(['lower', 'x']);
  });
});
