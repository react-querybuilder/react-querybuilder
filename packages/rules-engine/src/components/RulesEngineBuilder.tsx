import type { RuleGroupType, RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import { QueryBuilderStateProvider } from 'react-querybuilder';
import type { RulesEngineProps } from '../types';
import { RulesEngineBuilderInternal } from './RulesEngineBuilderInternal';

export const RulesEngineBuilder = <RG extends RuleGroupTypeAny = RuleGroupType>(
  props: RulesEngineProps
): React.JSX.Element => (
  <QueryBuilderStateProvider>
    <RulesEngineBuilderInternal<RG> props={props} />
  </QueryBuilderStateProvider>
);
