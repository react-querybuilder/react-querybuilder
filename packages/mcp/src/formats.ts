import type { ExportFormat } from '@react-querybuilder/core';

/** ORM formats: need live ORM objects (columns, `Op`, etc.); unsupported over JSON. */
export type OrmFormat = 'drizzle' | 'prisma' | 'sequelize' | 'tanstack_db';

/** `format_query` formats (every {@link ExportFormat} except {@link OrmFormat}s). */
export type McpExportFormat = Exclude<ExportFormat, OrmFormat>;

/** `parse_query` source formats. */
export type McpImportFormat =
  | 'sql'
  | 'cel'
  | 'mongodb'
  | 'jsonlogic'
  | 'spel'
  | 'jsonata'
  | 'cypher'
  | 'gql'
  | 'gremlin'
  | 'sparql';

export const ormFormats: readonly OrmFormat[] = ['drizzle', 'prisma', 'sequelize', 'tanstack_db'];

// Record keys enforce completeness (fails typecheck if `ExportFormat` gains a member)
const exportFormatMap: Record<McpExportFormat, true> = {
  sql: true,
  parameterized: true,
  parameterized_named: true,
  mongodb_query: true,
  mongodb: true,
  cel: true,
  spel: true,
  jsonlogic: true,
  elasticsearch: true,
  jsonata: true,
  ldap: true,
  cypher: true,
  gql: true,
  sparql: true,
  gremlin: true,
  qdrant: true,
  natural_language: true,
  json: true,
  json_without_ids: true,
  diagnostics: true,
};

export const exportFormats: readonly McpExportFormat[] = Object.keys(
  exportFormatMap
) as McpExportFormat[];

export const importFormats: readonly McpImportFormat[] = [
  'sql',
  'cel',
  'mongodb',
  'jsonlogic',
  'spel',
  'jsonata',
  'cypher',
  'gql',
  'gremlin',
  'sparql',
];
