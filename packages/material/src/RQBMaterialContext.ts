import { createContext } from 'react';
import type { RQBMaterialComponents } from './types';

export const RQBMaterialContext = createContext<RQBMaterialComponents | null>(null);
