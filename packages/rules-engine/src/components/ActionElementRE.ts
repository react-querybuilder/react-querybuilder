import type { ActionProps } from 'react-querybuilder';
import { ActionElement } from 'react-querybuilder';
import type { SchemaRE } from '../types';

/**
 * @group Props
 */
export interface ActionElementREProps extends Omit<
  ActionProps,
  'schema' | 'ruleOrGroup' | 'rules'
> {
  schema: SchemaRE;
}

/**
 * @group Components
 */
export const ActionElementRE = ActionElement as unknown as (
  props: ActionElementREProps
) => ReturnType<typeof ActionElement>;
