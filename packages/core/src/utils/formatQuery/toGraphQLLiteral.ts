/**
 * Options for {@link toGraphQLLiteral}.
 *
 * @internal
 */
export interface ToGraphQLLiteralOptions {
  /** Object keys whose string values are emitted as unquoted enum literals. */
  enumKeys?: readonly string[];
}

const nameRegex = /^[_A-Za-z][_0-9A-Za-z]*$/;

/**
 * Serializes plain JSON-like data as a GraphQL input value literal: object keys unquoted,
 * strings JSON-escaped (GraphQL string escapes are a JSON subset for these), and string
 * values under `enumKeys` as bare enum names. `undefined` properties are omitted; bigints
 * are emitted as integers. Throws on invalid enum/key names or non-finite numbers.
 *
 * Intended for Weaviate `where` filters (`enumKeys: ['operator']`). Test-only for now.
 *
 * @internal
 */
export const toGraphQLLiteral = (value: unknown, opts: ToGraphQLLiteralOptions = {}): string => {
  const enumKeys = new Set(opts.enumKeys);
  const ser = (v: unknown, asEnum = false): string => {
    if (v === null) return 'null';
    if (Array.isArray(v)) return `[${v.map(x => ser(x, asEnum)).join(', ')}]`;
    switch (typeof v) {
      case 'string':
        if (!asEnum) return JSON.stringify(v);
        if (!nameRegex.test(v)) throw new Error(`Invalid GraphQL enum value: ${v}`);
        return v;
      case 'number':
        if (!Number.isFinite(v)) throw new Error(`Invalid GraphQL number: ${v}`);
        return `${v}`;
      case 'bigint':
      case 'boolean':
        return `${v}`;
      case 'object': {
        const entries = Object.entries(v as Record<string, unknown>).filter(
          ([, x]) => x !== undefined
        );
        return `{${entries
          .map(([k, x]) => {
            if (!nameRegex.test(k)) throw new Error(`Invalid GraphQL name: ${k}`);
            return `${k}: ${ser(x, enumKeys.has(k))}`;
          })
          .join(', ')}}`;
      }
    }
    throw new Error(`Unsupported GraphQL value type: ${typeof v}`);
  };
  return ser(value);
};
