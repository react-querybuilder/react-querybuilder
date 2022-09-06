import { createContext } from 'react';
import type { QueryBuilderContextProps } from 'react-querybuilder';

export const QueryBuilderContext = createContext<QueryBuilderContextProps>({});

QueryBuilderContext.displayName = 'QueryBuilderContext';
