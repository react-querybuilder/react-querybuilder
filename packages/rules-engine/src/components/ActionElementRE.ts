import type { ActionProps } from 'react-querybuilder';
import { ActionElement } from 'react-querybuilder';
import type { SchemaRE } from '../types';

export interface ActionElementREProps extends Omit<
  ActionProps,
  'schema' | 'ruleOrGroup' | 'rules'
> {
  schema: SchemaRE;
}

export const ActionElementRE = ActionElement as unknown as (
  props: ActionElementREProps
) => ReturnType<typeof ActionElement>;
