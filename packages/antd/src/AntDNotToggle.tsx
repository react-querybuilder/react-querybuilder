import { Switch } from 'antd';
import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { NotToggleProps } from 'react-querybuilder';

export type AntDNotToggleProps = NotToggleProps & ComponentPropsWithoutRef<typeof Switch>;

export const AntDNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  // Props that should not be in extraProps
  path: _path,
  context: _context,
  validation: _validation,
  testID: _testID,
  schema: _schema,
  ruleGroup: _ruleGroup,
  ...extraProps
}: AntDNotToggleProps): React.JSX.Element => (
  <Switch
    title={title}
    className={className}
    onChange={v => handleOnChange(v)}
    checked={!!checked}
    disabled={disabled}
    checkedChildren={label}
    unCheckedChildren="="
    {...extraProps}
  />
);
