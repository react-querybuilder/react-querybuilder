/**
 * JSON Schema primitive type names.
 */
export type JSONSchemaTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

/**
 * Minimal JSON Schema type covering only the keyword subset emitted by
 * {@link getQueryJsonSchema} (valid under both draft-07 and 2020-12).
 */
export interface JSONSchema {
  $schema?: string;
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
  type?: JSONSchemaTypeName | JSONSchemaTypeName[];
  description?: string;
  enum?: unknown[];
  anyOf?: JSONSchema[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  items?: JSONSchema;
  minItems?: number;
  maxItems?: number;
}
