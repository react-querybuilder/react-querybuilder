import * as React from 'react';
import type { RulesEngineBuilderHeaderProps } from '../types';

export const RulesEngineBuilderHeader = (
  props: RulesEngineBuilderHeaderProps
): React.JSX.Element => {
  const {
    classnames,
    defaultAction,
    schema: { translations },
  } = props;

  return (
    <div className={classnames}>
      <button type="button" title={translations.addCondition.title}>
        {translations.addCondition.label}
      </button>
      <button type="button" disabled={!!defaultAction} title={translations.addAction.title}>
        {translations.addAction.label}
      </button>
    </div>
  );
};
