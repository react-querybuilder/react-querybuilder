import { clsx } from '@react-querybuilder/core';
import * as React from 'react';
import { standardClassnamesRE } from '../defaults';
import type { ConsequentProps } from '../types';

/**
 * Default body component for {@link ConsequentBuilder}.
 */
export const ConsequentBuilderBody = (props: ConsequentProps): React.JSX.Element => {
  const {
    consequent,
    consequentTypes = [],
    conditionPath,
    onConsequentChange,
    schema: {
      classnames: { consequentBuilderBody },
      components: { consequentSelector: ConsequentSelector },
      suppressStandardClassnames,
    },
  } = props;

  const className = React.useMemo(
    () =>
      clsx(
        suppressStandardClassnames || standardClassnamesRE.consequentBuilderBody,
        consequentBuilderBody
      ),
    [consequentBuilderBody, suppressStandardClassnames]
  );

  const handleOnChange = React.useCallback(
    (v: string) => onConsequentChange({ ...consequent, consequentType: v }),
    [onConsequentChange, consequent]
  );

  return (
    <div className={className}>
      {props.consequentTypes && (
        <ConsequentSelector
          schema={props.schema}
          path={conditionPath}
          level={conditionPath.length}
          value={consequent.consequentType}
          handleOnChange={handleOnChange}
          options={consequentTypes}
        />
      )}
    </div>
  );
};
