import clsx from 'clsx';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { RulesEngineActionProps } from '../types';

/**
 * Default header component for {@link RulesEngineActionBuilder}.
 */
export const RulesEngineActionBuilderHeader = (
  props: RulesEngineActionProps
): React.JSX.Element => {
  const {
    onActionChange,
    schema: {
      components: { removeAction: RemoveAction },
      classnames: { actionBuilderHeader, blockLabel },
      translations,
      suppressStandardClassnames,
    },
  } = props;

  const wrapperClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.actionBuilderHeader,
        actionBuilderHeader
      ),
    [actionBuilderHeader, suppressStandardClassnames]
  );
  const labelClassName = React.useMemo(
    () => clsx(suppressStandardClassnames || standardClassnamesRE.blockLabel, blockLabel),
    [blockLabel, suppressStandardClassnames]
  );

  const removeAction = React.useCallback(() => onActionChange(), [onActionChange]);

  const { label, title } = React.useMemo(
    () => (props.standalone ? translations.blockLabelElse : translations.blockLabelThen),
    [props.standalone, translations]
  );

  return (
    <div className={wrapperClassName}>
      <div className={labelClassName} title={title}>
        {label}
      </div>
      <RemoveAction
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        handleOnClick={removeAction}
        title={translations.removeAction.title}
        label={translations.removeAction.label}
      />
    </div>
  );
};
