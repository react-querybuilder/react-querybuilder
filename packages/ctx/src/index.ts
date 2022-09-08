import type { QueryBuilderContextProps } from '@react-querybuilder/ts';
import { createContext } from 'react';

export const QueryBuilderContext = createContext<QueryBuilderContextProps>({});

QueryBuilderContext.displayName = 'QueryBuilderContext';
