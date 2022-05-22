import { useEffect } from 'react';
import type { RuleGroupTypeAny, Schema } from '../types';

export const useLog = (
  debugMode: boolean,
  schema: Schema,
  root: RuleGroupTypeAny,
  queryState: RuleGroupTypeAny,
  onLog = console.log
) => {
  useEffect(() => {
    if (debugMode) {
      onLog({ root, queryState, schema });
    }
  }, [debugMode, onLog, queryState, root, schema]);
};
