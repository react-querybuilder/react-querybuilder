import { Button } from 'antd';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { ActionWithRulesProps } from 'react-querybuilder';

// TODO: This may be unnecessary. Find out if there's a way to allow
// `data-${string}` index keys without breaking other type contraints.
type RemoveDataIndexKeys<T> = {
  [K in keyof T as `data-${string}` extends K ? never : K]: T[K];
};

/**
 * @group Props
 */
export type AntDActionProps = ActionWithRulesProps &
  RemoveDataIndexKeys<ComponentPropsWithoutRef<typeof Button>>;

/**
 * @group Components
 */
export const AntDActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
  // Props that should not be in extraProps
  testID: _testID,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  ruleOrGroup: _ruleOrGroup,
  schema: _schema,
  ...extraProps
}: AntDActionProps): React.JSX.Element => (
  <Button
    type="primary"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}
    {...extraProps}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);
