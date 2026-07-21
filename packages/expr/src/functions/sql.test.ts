import type { SQLPreset } from '@react-querybuilder/core';
import { resolvePresetSerializer } from '../utils/resolvePresetSerializer';
import { defaultSQLSerializers } from './sql';

// Resolve+invoke a built-in serializer for the given preset (opts ignored by the built-ins).
const call = (fn: string, preset: SQLPreset | undefined, ...args: string[]): string =>
  resolvePresetSerializer(defaultSQLSerializers[fn], preset)({}, ...args);

describe('defaultSQLSerializers', () => {
  it('serializes the parenthesized arithmetic operators', () => {
    expect(call('add', undefined, 'a', 'b')).toBe('(a + b)');
    expect(call('subtract', undefined, 'a', 'b')).toBe('(a - b)');
    expect(call('multiply', undefined, 'a', 'b')).toBe('(a * b)');
    expect(call('divide', undefined, 'a', 'b')).toBe('(a / b)');
    expect(call('mod', undefined, 'a', 'b')).toBe('(a % b)');
  });

  it('serializes the call-style scalar functions', () => {
    expect(call('abs', undefined, 'x')).toBe('ABS(x)');
    expect(call('upper', undefined, 'x')).toBe('UPPER(x)');
    expect(call('lower', undefined, 'x')).toBe('LOWER(x)');
  });

  it('emits LEAST/GREATEST by default and MIN/MAX for the sqlite preset', () => {
    expect(call('min', undefined, 'a', 'b', 'c')).toBe('LEAST(a, b, c)');
    expect(call('max', undefined, 'a', 'b', 'c')).toBe('GREATEST(a, b, c)');
    expect(call('min', 'sqlite', 'a', 'b')).toBe('MIN(a, b)');
    expect(call('max', 'sqlite', 'a', 'b')).toBe('MAX(a, b)');
  });
});
