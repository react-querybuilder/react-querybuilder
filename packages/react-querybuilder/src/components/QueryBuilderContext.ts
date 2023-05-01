import { createContext } from 'react';
import type { QueryBuilderContextProps } from '../types';

export const QueryBuilderContext = createContext<QueryBuilderContextProps>({});

QueryBuilderContext.displayName = 'QueryBuilderContext';
