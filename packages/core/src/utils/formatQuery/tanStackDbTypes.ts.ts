import type * as TanStackDB from '@tanstack/db';

export type TsDbOperators = Pick<
  typeof TanStackDB,
  'and' | 'eq' | 'gt' | 'gte' | 'inArray' | 'isNull' | 'like' | 'lt' | 'lte' | 'not' | 'or'
>;

export type TanStackDbWhereCallbackReturnType = ReturnType<TsDbOperators['and']>;

export type TanStackDbWhereCallback = (
  refs: Record<string, unknown>
) => TanStackDbWhereCallbackReturnType;

class FallbackExpression {
  value: boolean;
  type: 'val';
  __returnType: boolean;

  constructor(value: boolean) {
    this.value = value;
    this.type = 'val';
    this.__returnType = true;
    return this;
  }
}

export const tanStackDbFallbackExpression: FallbackExpression = new FallbackExpression(true);
