import { useEffect, useMemo } from 'react';
import type { RuleGroupTypeAny, Schema } from '../types';

export const useLog = (
  debugMode: boolean,
  rqbLogEl: HTMLElement | null,
  schema: Schema,
  root: RuleGroupTypeAny,
  queryState: RuleGroupTypeAny
) => {
  const log = useMemo(
    () =>
      process.env.NODE_ENV === 'test'
        ? (r: any) => {
            const div = document?.createElement('div');
            div.innerHTML = JSON.stringify(r, null, 2);
            rqbLogEl?.appendChild(div);
          }
        : /* istanbul ignore next */ console.log,
    [rqbLogEl]
  );

  useEffect(() => {
    if (debugMode) {
      log({ root, queryState, schema });
    }
  }, [debugMode, log, queryState, root, schema]);
};
