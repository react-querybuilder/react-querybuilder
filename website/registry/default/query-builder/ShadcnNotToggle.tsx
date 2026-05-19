import * as React from 'react';
import { useId } from 'react';
import type { SwitchProps } from '@/components/ui/switch';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { NotToggleProps } from 'react-querybuilder';

/**
 * @group Props
 */
export interface ShadcnNotToggleProps extends NotToggleProps, Partial<SwitchProps> {}

/**
 * @group Components
 */
export const ShadcnNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
  testID,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ruleGroup: _ruleGroup,
  ...otherProps
}: ShadcnNotToggleProps): React.JSX.Element => {
  const id = useId();
  return (
    <>
      <Switch
        {...otherProps}
        id={id}
        data-testid={testID}
        className={className}
        title={title}
        checked={!!checked}
        disabled={disabled}
        onCheckedChange={handleOnChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </>
  );
};
