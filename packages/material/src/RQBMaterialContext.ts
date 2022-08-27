import { createContext } from 'react';
import type { RQBMaterialComponents } from './types';

export const RQBMaterialContext = createContext<Partial<RQBMaterialComponents> | null>(null);

RQBMaterialContext.displayName = 'RQBMaterialContext';
