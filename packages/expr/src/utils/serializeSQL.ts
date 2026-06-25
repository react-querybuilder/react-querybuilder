import type { ValueProcessorOptions } from '@react-querybuilder/core';
import { defaultValueProcessorByRule, getQuotedFieldName } from '@react-querybuilder/core';
import type { ExpressionFunctionRegistry, ExpressionNode } from '../types';
import { isNumericLeaf } from './leafValue';

/**
 * Recursively serializes an expression node to a SQL fragment. `field` nodes are quoted
 * per the dialect; `value` nodes reuse the stock value processor (numbers bare, strings
 * quoted/escaped); `func` nodes delegate to the registered `sql` serializer.
 */
export const serializeSQL = (
  node: ExpressionNode,
  registry: ExpressionFunctionRegistry,
  options: ValueProcessorOptions = {}
): string => {
  if (node.kind === 'field') {
    return getQuotedFieldName(node.field, options);
  }
  if (node.kind === 'value') {
    const parseNumbers = isNumericLeaf(node) ? true : options.parseNumbers;
    return defaultValueProcessorByRule(
      { field: '', operator: '=', value: node.value },
      { ...options, parseNumbers }
    );
  }
  const fn = registry[node.fn];
  if (!fn?.sql) {
    throw new Error(`No "sql" serializer for expression function "${node.fn}"`);
  }
  return fn.sql(...node.args.map(arg => serializeSQL(arg, registry, options)));
};
