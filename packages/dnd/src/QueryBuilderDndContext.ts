import { createContext } from 'react';
import { defaultControlElements } from 'react-querybuilder';
import type { QueryBuilderDndContextProps } from './types';

const { rule, ruleGroup, combinatorSelector } = defaultControlElements;

export const QueryBuilderDndContext = createContext<QueryBuilderDndContextProps>({
  baseControls: { rule, ruleGroup, combinatorSelector },
});
