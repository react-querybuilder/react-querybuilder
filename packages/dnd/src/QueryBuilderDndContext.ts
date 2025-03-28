import type { Context } from 'react';
import { createContext } from 'react';
import { defaultControlElements } from 'react-querybuilder';
import type { QueryBuilderDndContextProps } from './types';

const { rule, ruleGroup, combinatorSelector } = defaultControlElements;

/**
 * @group Components
 */
export const QueryBuilderDndContext: Context<QueryBuilderDndContextProps> =
  createContext<QueryBuilderDndContextProps>({
    baseControls: { rule, ruleGroup, combinatorSelector },
  });
