import { configureRqbStore } from './configureRqbStore';
import type { RqbStore } from './types';

export const queryBuilderStore: RqbStore = configureRqbStore(true);
