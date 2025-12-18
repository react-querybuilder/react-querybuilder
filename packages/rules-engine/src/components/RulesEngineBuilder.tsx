import * as React from 'react';
import { QueryBuilderStateProvider } from 'react-querybuilder';
import type { RulesEngineProps } from '../types';
import { RulesEngineBuilderInternal } from './RulesEngineBuilderInternal';

export const RulesEngineBuilder = (props: RulesEngineProps): React.JSX.Element => (
  <QueryBuilderStateProvider>
    <RulesEngineBuilderInternal props={props} />
  </QueryBuilderStateProvider>
);
