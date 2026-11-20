// Type-only assertions for `Field#datatype` (must stay `unknown`; non-breaking)
import type { Field, FieldDatatypeCategory, FullField } from '.';

type Expect<T extends true> = T;
type Extends<A, B> = A extends B ? true : false;
type IsUnknown<T> = unknown extends T ? ([T] extends [unknown] ? true : false) : false;
type Datatype = FullField['datatype'];

enum DT {
  Int,
}

// Interfaces may redeclare `datatype` w/ any type
export interface NumberDatatypeField extends Field {
  datatype: number;
}
export interface ObjectDatatypeField extends FullField {
  datatype?: { sql: string };
}

export type DatatypeTests = [
  Expect<IsUnknown<Datatype>>,
  Expect<Extends<FieldDatatypeCategory, Datatype>>,
  Expect<Extends<'VARCHAR(50)', Datatype>>,
  Expect<Extends<DT, Datatype>>,
  Expect<Extends<string[], Datatype>>,
];

// `comparator` callable w/o `meta`
export const callComparator = (fd: FullField, f: FullField): boolean =>
  typeof fd.comparator === 'function' && fd.comparator(f, '=');
