import type { ShiftActionsProps } from 'react-querybuilder';
import { ShiftActions } from 'react-querybuilder';
import type { SchemaRE } from '../types';

/**
 * @group Props
 */
export interface ShiftActionsREProps extends Omit<ShiftActionsProps, 'schema' | 'ruleOrGroup'> {
  schema: SchemaRE;
}

/**
 * @group Components
 */
export const ShiftActionsRE = ShiftActions as unknown as (
  props: ShiftActionsREProps
) => ReturnType<typeof ShiftActions>;
