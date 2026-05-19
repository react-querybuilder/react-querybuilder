import * as React from 'react';
import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import type { ShiftActionsProps } from 'react-querybuilder';

/**
 * @group Components
 */
export const ShadcnShiftActions = ({
  shiftUp,
  shiftDown,
  shiftUpDisabled,
  shiftDownDisabled,
  disabled,
  className,
  labels,
  titles,
  testID,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ruleOrGroup: _ruleOrGroup,
}: ShiftActionsProps): React.JSX.Element => (
  <div data-testid={testID} className={className}>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled || shiftUpDisabled}
      onClick={shiftUp}
      title={titles?.shiftUp}>
      {labels?.shiftUp}
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled || shiftDownDisabled}
      onClick={shiftDown}
      title={titles?.shiftDown}>
      {labels?.shiftDown}
    </Button>
  </div>
);
