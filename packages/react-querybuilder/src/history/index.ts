import { injectSlice } from 'react-querybuilder';
import { queryHistorySlice } from './queryHistorySlice';

// Injected at module scope so that the slice is only added to the store—and only included in
// the bundle—when this entry point is imported.
injectSlice(queryHistorySlice);

export * from './QueryBuilderHistory';
export * from './QueryBuilderHistoryContext';
export * from './queryHistorySlice';
export * from './UndoRedoActions';
export * from './types';
export * from './useQueryBuilderHistory';
