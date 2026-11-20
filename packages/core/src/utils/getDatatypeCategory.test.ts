import type { FullField } from '../types';
import { getDatatypeCategory } from './getDatatypeCategory';
import { toFullOption } from './optGroupUtils';

const f = (props: Partial<FullField>): FullField =>
  toFullOption({ name: 'f', label: 'F', ...props } as FullField);

describe('getDatatypeCategory', () => {
  it.each([
    ['string', 'string'],
    ['TEXT', 'string'],
    ['VARCHAR(50)', 'string'],
    ['character varying(255)', 'string'],
    ['nvarchar(max)', 'string'],
    ['PgVarchar', 'string'],
    ['PgText', 'string'],
    ['uuid', 'string'],
    ['citext', 'string'],
    ['clob', 'string'],
    ['bigint', 'bigint'],
    ['int8', 'bigint'],
    ['Int64', 'bigint'],
    ['bigserial', 'bigint'],
    ['PgBigInt53', 'bigint'],
    ['bigint unsigned', 'bigint'],
    ['number', 'number'],
    ['int', 'number'],
    ['INTEGER', 'number'],
    ['int4', 'number'],
    ['smallint', 'number'],
    ['tinyint(1)', 'number'],
    ['int unsigned', 'number'],
    ['decimal(10,2)', 'number'],
    ['numeric', 'number'],
    ['float8', 'number'],
    ['double precision', 'number'],
    ['PgDoublePrecision', 'number'],
    ['real', 'number'],
    ['money', 'number'],
    ['serial', 'number'],
    ['MySqlInt', 'number'],
    ['boolean', 'boolean'],
    ['bool', 'boolean'],
    ['PgBoolean', 'boolean'],
    ['date', 'date'],
    ['PgDateString', 'date'],
    ['datetime', 'datetime'],
    ['datetime2', 'datetime'],
    ['datetimeoffset', 'datetime'],
    ['smalldatetime', 'datetime'],
    ['timestamp', 'datetime'],
    ['timestamp with time zone', 'datetime'],
    ['timestamptz', 'datetime'],
    ['time', 'time'],
    ['time with time zone', 'time'],
    ['timetz', 'time'],
    ["enum('a','b')", 'enum'],
    ['PgEnumColumn', 'enum'],
    ['array', 'array'],
    ['int[]', 'array'],
    ["SET('a','b')", 'array'],
    ['json', 'object'],
    ['jsonb', 'object'],
    ['object', 'object'],
    ['unknown', 'unknown'],
  ])('%s → %s', (datatype, expected) => {
    expect(getDatatypeCategory(f({ datatype }))).toBe(expected);
  });

  it('handles multi-type datatypes', () => {
    expect(getDatatypeCategory(f({ datatype: 'string|number' }))).toEqual(['string', 'number']);
    expect(getDatatypeCategory(f({ datatype: 'decimal(10,2) | int' }))).toBe('number');
    expect(getDatatypeCategory(f({ datatype: 'text|whatever' }))).toBe('string');
  });

  it('falls through to hints for unrecognized datatypes', () => {
    expect(getDatatypeCategory(f({ datatype: 'geometry', inputType: 'number' }))).toBe('number');
    expect(getDatatypeCategory(f({ datatype: '  ' }))).toBeNull();
    expect(getDatatypeCategory(f({ datatype: 'interval' }))).toBeNull();
    // Ambiguous: Oracle `LONG` is text; `bit(n)` is a bit string
    expect(getDatatypeCategory(f({ datatype: 'long' }))).toBeNull();
    expect(getDatatypeCategory(f({ datatype: 'bit' }))).toBeNull();
    expect(getDatatypeCategory(f({ datatype: 'bit(8)' }))).toBeNull();
  });

  it('ignores non-string datatypes', () => {
    expect(getDatatypeCategory(f({ datatype: 1 }))).toBeNull();
    expect(getDatatypeCategory(f({ datatype: ['string', 'number'] }))).toBeNull();
    expect(getDatatypeCategory(f({ datatype: { sql: 'int' }, inputType: 'date' }))).toBe('date');
  });

  it('uses datatypeMap', () => {
    const datatypeMap = { Geometry: 'object', interval: 'string', 'VARCHAR(50)': 'enum' } as const;
    expect(getDatatypeCategory(f({ datatype: 'geometry' }), { datatypeMap })).toBe('object');
    expect(getDatatypeCategory(f({ datatype: 'INTERVAL' }), { datatypeMap })).toBe('string');
    expect(getDatatypeCategory(f({ datatype: 'varchar(50)' }), { datatypeMap })).toBe('enum');
    expect(getDatatypeCategory(f({ datatype: 'interval|int' }), { datatypeMap })).toEqual([
      'string',
      'number',
    ]);
    expect(getDatatypeCategory(f({ datatype: 'VARCHAR(50)|int' }), { datatypeMap })).toEqual([
      'enum',
      'number',
    ]);
    expect(getDatatypeCategory(f({ datatype: 'constructor' }), { datatypeMap: {} })).toBeNull();
  });

  it('handles pathological/edge input', () => {
    expect(getDatatypeCategory(f({ datatype: '('.repeat(50_000) }))).toBeNull();
    expect(getDatatypeCategory(f({ datatype: 'enum(a|b)|int' }))).toEqual(['enum', 'number']);
    expect(getDatatypeCategory(f({ datatype: 'pgint' }))).toBe('number');
    expect(getDatatypeCategory(f({ inputType: 'constructor' }))).toBeNull();
    expect(getDatatypeCategory(f({ valueEditorType: 'toString' as never }))).toBeNull();
  });

  it('uses hints', () => {
    expect(getDatatypeCategory(f({ matchModes: true }))).toBe('array');
    expect(getDatatypeCategory(f({ matchModes: ['all'] }))).toBe('array');
    expect(getDatatypeCategory(f({ matchModes: [] }))).toBeNull();
    expect(getDatatypeCategory(f({ subproperties: [{ name: 'a', label: 'A' }] }))).toBe('array');
    expect(getDatatypeCategory(f({ valueEditorType: 'checkbox' }))).toBe('boolean');
    expect(getDatatypeCategory(f({ valueEditorType: 'switch' }))).toBe('boolean');
    expect(getDatatypeCategory(f({ valueEditorType: 'multiselect' }))).toBe('enum');
    expect(getDatatypeCategory(f({ valueEditorType: 'textarea' }))).toBeNull();
    expect(getDatatypeCategory(f({ valueEditorType: () => 'checkbox' }))).toBeNull();
    expect(getDatatypeCategory(f({ values: [{ name: 'a', label: 'A' }] }))).toBe('enum');
    expect(getDatatypeCategory(f({ values: [] }))).toBeNull();
    expect(getDatatypeCategory(f({ inputType: 'range' }))).toBe('number');
    expect(getDatatypeCategory(f({ inputType: 'week' }))).toBe('date');
    expect(getDatatypeCategory(f({ inputType: 'datetime-local' }))).toBe('datetime');
    expect(getDatatypeCategory(f({ inputType: 'time' }))).toBe('time');
    expect(getDatatypeCategory(f({ inputType: 'email' }))).toBe('string');
    expect(getDatatypeCategory(f({ inputType: 'color' }))).toBeNull();
    expect(getDatatypeCategory(f({}))).toBeNull();
  });

  it('skips hints when disabled', () => {
    expect(getDatatypeCategory(f({ inputType: 'number' }), { hints: false })).toBeNull();
    expect(getDatatypeCategory(f({ datatype: 'int' }), { hints: false })).toBe('number');
  });

  it('handles missing fieldData', () => {
    expect(getDatatypeCategory(undefined as unknown as FullField)).toBeNull();
  });
});
