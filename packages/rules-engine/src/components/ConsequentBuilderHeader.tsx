import clsx from 'clsx';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { ConsequentProps } from '../types';

/**
 * Default header component for {@link ConsequentBuilder}.
 */
export const ConsequentBuilderHeader = (props: ConsequentProps): React.JSX.Element => {
  const {
    onConsequentChange,
    schema: {
      components: { removeConsequent: RemoveConsequent },
      classnames: { consequentBuilderHeader, blockLabel },
      translations,
      suppressStandardClassnames,
    },
  } = props;

  const wrapperClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.consequentBuilderHeader,
        consequentBuilderHeader
      ),
    [consequentBuilderHeader, suppressStandardClassnames]
  );
  const labelClassName = React.useMemo(
    () => clsx(suppressStandardClassnames || standardClassnamesRE.blockLabel, blockLabel),
    [blockLabel, suppressStandardClassnames]
  );

  const removeConsequent = React.useCallback(() => onConsequentChange(), [onConsequentChange]);

  const { label, title } = React.useMemo(
    () => (props.standalone ? translations.blockLabelElse : translations.blockLabelThen),
    [props.standalone, translations]
  );

  return (
    <div className={wrapperClassName}>
      <div className={labelClassName} title={title}>
        {label}
      </div>
      <RemoveConsequent
        schema={props.schema}
        path={props.conditionPath}
        level={props.conditionPath.length}
        handleOnClick={removeConsequent}
        title={translations.removeConsequent.title}
        label={translations.removeConsequent.label}
      />
    </div>
  );
};
