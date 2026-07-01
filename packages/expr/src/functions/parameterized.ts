import type { ParameterizedSerializerRegistry } from '../types';
import { defaultSQLSerializers } from './sql';

/**
 * Built-in "parameterized" / "parameterized_named" serializers. The parameterized walker
 * binds `value` leaves as placeholders and passes the resulting placeholder/field strings
 * to these serializers exactly as the "sql" walker passes literal strings — so the built-in
 * function serializers are identical to {@link defaultSQLSerializers} (re-exported here).
 */
export const defaultParameterizedSerializers: ParameterizedSerializerRegistry =
  defaultSQLSerializers;
