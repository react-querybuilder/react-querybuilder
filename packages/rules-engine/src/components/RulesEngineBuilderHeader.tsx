import * as React from 'react';
import type { RulesEngineBuilderHeaderProps } from '../types';

export const RulesEngineBuilderHeader = (
  props: RulesEngineBuilderHeaderProps
): React.JSX.Element => {
  const {
    classnames,
    defaultAction,
    schema: {
      components: { addAction: AddAction, addCondition: AddCondition },
      translations,
    },
  } = props;

  return (
    <div className={classnames}>
      <AddCondition
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        title={translations.addCondition.title}
        label={translations.addCondition.label}
      />
      <AddAction
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        // oxlint-disable-next-line jsx-no-new-function-as-prop
        handleOnClick={() => {}}
        disabled={!!defaultAction}
        title={translations.addAction.title}
        label={translations.addAction.label}
      />
    </div>
  );
};
