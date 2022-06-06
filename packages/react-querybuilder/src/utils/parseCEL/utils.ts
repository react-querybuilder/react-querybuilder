import type { DefaultOperatorName } from '../../types/index.noReact';
import type {
  CELExpression,
  CELIdentifier,
  CELLiteral,
  CELNumericLiteral,
  CELRelation,
  CELRelop,
} from './types';

export const convertRelop = (op: CELRelop) => op.replace(/^==$/, '=') as DefaultOperatorName;

export const isCELLiteral = (expr: CELExpression): expr is CELLiteral =>
  isCELNumericLiteral(expr) ||
  expr.type === 'BooleanLiteral' ||
  expr.type === 'NullLiteral' ||
  expr.type === 'BytesLiteral' ||
  expr.type === 'StringLiteral';
export const isCELNumericLiteral = (expr: CELExpression): expr is CELNumericLiteral =>
  expr.type === 'FloatLiteral' ||
  expr.type === 'IntegerLiteral' ||
  expr.type === 'UnsignedIntegerLiteral';
export const isCELRelation = (expr: CELExpression): expr is CELRelation => expr.type === 'Relation';
export const isCELIdentifier = (expr: CELExpression): expr is CELIdentifier =>
  expr.type === 'Identifier';

export const evalCELLiteralValue = (literal: CELLiteral) =>
  literal.type === 'StringLiteral'
    ? literal.value.replace(/^(['"]?)(.+?)\1$/, '$2')
    : literal.type === 'BooleanLiteral'
    ? literal.value
    : parseFloat(literal.value ?? ''); // TODO: handle complex numeric types
