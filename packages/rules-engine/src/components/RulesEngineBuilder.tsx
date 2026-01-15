import * as React from 'react';
import { QueryBuilderStateProvider } from 'react-querybuilder';
import type { RulesEngineProps } from '../types';
import { RulesEngineBuilderInternal } from './RulesEngineBuilderInternal';

/**
 * The rules engine builder component for React.
 *
 * See https://react-querybuilder.js.org/ for demos and documentation.
 *
 * @group Components
 */
export const RulesEngineBuilder = (props: RulesEngineProps): React.JSX.Element => (
  <QueryBuilderStateProvider>
    <RulesEngineBuilderInternal props={props} />
  </QueryBuilderStateProvider>
);
