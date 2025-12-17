import type { VersatileSelectorProps } from 'react-querybuilder';
import { ValueSelector } from 'react-querybuilder';
import type { SchemaRE } from '../types';

export interface ValueSelectorREProps extends Omit<
  VersatileSelectorProps,
  'schema' | 'rule' | 'ruleOrGroup' | 'rules' | 'operator'
> {
  schema: SchemaRE;
}

export const ValueSelectorRE = ValueSelector as unknown as (
  props: ValueSelectorREProps
) => ReturnType<typeof ValueSelector>;
