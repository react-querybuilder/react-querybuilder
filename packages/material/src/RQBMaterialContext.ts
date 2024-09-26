import type { Context } from 'react';
import { createContext } from 'react';
import type { RQBMaterialComponents } from './types';

export const RQBMaterialContext: Context<RQBMaterialComponents | null> =
  createContext<RQBMaterialComponents | null>(null);
