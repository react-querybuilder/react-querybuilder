import { messages } from '../messages';
import { getRqbStore } from './getRqbStore';
import type { RqbStore } from './types';
import { warningsSlice } from './warningsSlice';

export const queryBuilderStore: RqbStore = getRqbStore(true);

// istanbul ignore if
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  queryBuilderStore.dispatch(warningsSlice.actions.rqbWarn(messages.errorDeprecatedDebugImport));
}
