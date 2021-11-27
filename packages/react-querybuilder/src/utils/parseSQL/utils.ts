import type { SQLExpression, SQLIdentifier, SQLLiteralValue, SQLWhereObjectAny } from './types';

export const isSQLExpressionNotString = (v?: string | SQLExpression): v is SQLExpression =>
  !!v && typeof v !== 'string';

export const isSQLLiteralValue = (v?: SQLWhereObjectAny): v is SQLLiteralValue =>
  !!v && (v.type === 'String' || v.type === 'Number' || v.type === 'Boolean');

export const isSQLIdentifier = (v?: SQLWhereObjectAny): v is SQLIdentifier =>
  !!v && v.type === 'Identifier';
