import { defaultControlElements } from 'react-querybuilder';
import { createContext } from 'react';
import type { QueryBuilderDndContextProps } from './types';

const { rule, ruleGroup, combinatorSelector } = defaultControlElements;

export const QueryBuilderDndContext = createContext<QueryBuilderDndContextProps>({
  baseControls: { rule, ruleGroup, combinatorSelector },
});

QueryBuilderDndContext.displayName = 'QueryBuilderDndContext';
