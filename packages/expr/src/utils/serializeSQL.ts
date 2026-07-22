import type { ValueProcessorOptions } from '@react-querybuilder/core';
import {
  defaultValueProcessorByRule,
  getQuotedFieldName,
  withParamPrefix,
} from '@react-querybuilder/core';
import type { ExpressionNode, SQLSerializerRegistry } from '../types';
import { isNumericLeaf } from './leafValue';
import { resolvePresetSerializer } from './resolvePresetSerializer';

/**
 * Recursively serializes an expression node to a SQL fragment. `field` nodes are quoted
 * per the dialect; `value` nodes reuse the stock value processor (numbers bare, strings
 * quoted/escaped); `parameter` nodes emit a (prefix-aware) bind-variable reference; `func`
 * nodes delegate to the registered `sql` serializer, resolved for the active preset and
 * invoked opts-first.
 */
export const serializeSQL = (
  node: ExpressionNode,
  serializers: SQLSerializerRegistry,
  options: ValueProcessorOptions = {}
): string => {
  if (node.kind === 'field') {
    return getQuotedFieldName(node.field, options);
  }
  if (node.kind === 'parameter') {
    return withParamPrefix(node.parameter, options.paramPrefix);
  }
  if (node.kind === 'value') {
    const parseNumbers = isNumericLeaf(node) || options.parseNumbers;
    return defaultValueProcessorByRule(
      { field: '', operator: '=', value: node.value },
      { ...options, parseNumbers }
    );
  }
  const serializer = serializers[node.fn];
  if (!serializer) {
    throw new Error(`No "sql" serializer for expression function "${node.fn}"`);
  }
  const args = node.args.map(arg => serializeSQL(arg, serializers, options));
  return resolvePresetSerializer(serializer, options.preset)(options, ...args);
};
