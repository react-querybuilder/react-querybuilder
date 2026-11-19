// Type-only assertions for `Field#datatype`.
import type { FieldDatatypeCategory, FullField } from '.';

type Expect<T extends true> = T;
type Extends<A, B> = A extends B ? true : false;
type Datatype = NonNullable<FullField['datatype']>;

export type DatatypeTests = [
  // Known categories accepted (autocomplete)
  Expect<Extends<FieldDatatypeCategory, Datatype>>,
  // Arbitrary strings accepted (raw DB types)
  Expect<Extends<'VARCHAR(50)', Datatype>>,
  // Non-strings rejected
  Expect<Extends<number, Datatype> extends false ? true : false>,
];
