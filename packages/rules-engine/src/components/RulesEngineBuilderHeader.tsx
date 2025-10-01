import * as React from 'react';
import type { RulesEngineBuilderHeaderProps } from '../types';

export const RulesEngineBuilderHeader = (
  props: RulesEngineBuilderHeaderProps
): React.JSX.Element => (
  <div className={props.classnames}>
    <button>+ Condition</button>
    <button disabled={!!props.defaultAction}>+ Action</button>
  </div>
);
