import type { Context } from 'react';
import { createContext } from 'react';
import type { RQBMaterialComponents } from './types';

export interface RQBMaterialContextValue extends RQBMaterialComponents {
  showInputLabels?: boolean;
}

/**
 * @group Components
 */
export const RQBMaterialContext: Context<RQBMaterialContextValue | null> =
  createContext<RQBMaterialContextValue | null>(null);
