import type { DefaultOperatorName } from '../../types/index.noReact';
import type { CELExpression, CELRelation, CELRelop } from './types';

export const convertRelop = (op: CELRelop) => op.replace(/^==$/, '=') as DefaultOperatorName;

export const isCELRelation = (expr: CELExpression): expr is CELRelation => expr.type === 'Relation';
