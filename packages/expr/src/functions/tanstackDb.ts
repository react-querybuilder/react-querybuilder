import type { TanStackDbSerializerRegistry } from '../types';

/**
 * Built-in "tanstack_db" serializers. Arithmetic maps to TanStack DB's `add`/`subtract`/
 * `multiply`/`divide` expression functions; `upper`/`lower` map to `upper`/`lower`. TanStack
 * DB has no scalar `abs`/`mod`, and `min`/`max` are aggregates (invalid in a `where`
 * predicate), so those functions are intentionally omitted — expression rules using them are
 * omitted from the output. Each serializer receives the `ops` object, the format options,
 * then the serialized argument operands.
 */
export const defaultTanStackDbSerializers: TanStackDbSerializerRegistry = {
  add: (ops, _o, a, b) => ops.add(a, b),
  subtract: (ops, _o, a, b) => ops.subtract(a, b),
  multiply: (ops, _o, a, b) => ops.multiply(a, b),
  divide: (ops, _o, a, b) => ops.divide(a, b),
  upper: (ops, _o, x) => ops.upper(x),
  lower: (ops, _o, x) => ops.lower(x),
};
