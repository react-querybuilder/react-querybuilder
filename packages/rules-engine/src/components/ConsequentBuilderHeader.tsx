import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { ConsequentProps } from '../types';

/**
 * Default header component for {@link ConsequentBuilder}.
 *
 * @group Components
 */
export const ConsequentBuilderHeader: React.MemoExoticComponent<
  (props: ConsequentProps) => React.JSX.Element
> = React.memo(function ConsequentBuilderHeader(props: ConsequentProps): React.JSX.Element {
  const {
    onConsequentChange,
    standalone,
    schema: {
      components: { removeConsequent: RemoveConsequent },
      evaluationMode,
      classnames: {
        consequentBuilderHeader,
        blockLabel,
        blockLabelElse,
        blockLabelThen,
        blockLabelAlways,
      },
      translations,
      suppressStandardClassnames,
    },
  } = props;

  const isCumulative = evaluationMode === 'cumulative';

  const wrapperClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.consequentBuilderHeader,
        consequentBuilderHeader
      ),
    [consequentBuilderHeader, suppressStandardClassnames]
  );
  const labelClassName = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.blockLabel,
        blockLabel,
        standalone
          ? isCumulative
            ? [
                suppressStandardClassnames || standardClassnamesRE.blockLabelAlways,
                blockLabelAlways,
              ]
            : [suppressStandardClassnames || standardClassnamesRE.blockLabelElse, blockLabelElse]
          : [suppressStandardClassnames || standardClassnamesRE.blockLabelThen, blockLabelThen]
      ),
    [
      blockLabel,
      blockLabelAlways,
      blockLabelElse,
      blockLabelThen,
      isCumulative,
      standalone,
      suppressStandardClassnames,
    ]
  );

  const removeConsequent = React.useCallback(() => onConsequentChange(), [onConsequentChange]);

  const { label, title } = standalone
    ? isCumulative
      ? translations.blockLabelAlways
      : translations.blockLabelElse
    : translations.blockLabelThen;

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
});
