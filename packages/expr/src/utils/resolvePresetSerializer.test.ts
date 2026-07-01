import type { ValueProcessorOptions } from '@react-querybuilder/core';
import type { SQLSerializer, SQLSerializerFn } from '../types';
import { resolvePresetSerializer } from './resolvePresetSerializer';

const opts = {} as ValueProcessorOptions;

describe('resolvePresetSerializer', () => {
  it('returns a plain function serializer as-is', () => {
    const fn: SQLSerializerFn = (_o, x) => `F(${x})`;
    expect(resolvePresetSerializer(fn, 'sqlite')).toBe(fn);
  });

  it('returns the preset-specific override from a preset-keyed map', () => {
    const sqlite: SQLSerializerFn = (_o, ...a) => `S(${a.join()})`;
    const map: SQLSerializer = { default: (_o, ...a) => `D(${a.join()})`, sqlite };
    expect(resolvePresetSerializer(map, 'sqlite')).toBe(sqlite);
    expect(resolvePresetSerializer(map, 'sqlite')(opts, 'a', 'b')).toBe('S(a,b)');
  });

  it('falls back to default for a preset with no explicit override', () => {
    const def: SQLSerializerFn = (_o, ...a) => `D(${a.join()})`;
    const map: SQLSerializer = { default: def, sqlite: () => 'S' };
    expect(resolvePresetSerializer(map, 'mysql')).toBe(def);
  });

  it('falls back to default when no preset is given', () => {
    const def: SQLSerializerFn = (_o, ...a) => `D(${a.join()})`;
    const map: SQLSerializer = { default: def };
    expect(resolvePresetSerializer(map)).toBe(def);
  });
});
