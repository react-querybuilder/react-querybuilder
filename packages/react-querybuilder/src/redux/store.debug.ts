import { messages } from '../messages';
import { getRqbStore } from './getRqbStore';
import type { RqbStore } from './types';
import { warningsSlice } from './warningsSlice';

export const queryBuilderStore: RqbStore = getRqbStore(true);

queryBuilderStore.dispatch(warningsSlice.actions.rqbWarn(messages.errorDeprecatedDebugImport));
