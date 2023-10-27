import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';
import { useShiftActions } from 'react-querybuilder';

export const AntDShiftActions = ({
  path,
  disabled,
  className,
  // labels, // Labels are hard-coded in this component
  titles,
  testID,
  lastInGroup,
  schema: { combinators, dispatchQuery, getQuery },
}: ShiftActionsProps) => {
  const { shiftUp, shiftUpDisabled, shiftDown, shiftDownDisabled } = useShiftActions({
    combinators,
    disabled,
    dispatchQuery,
    getQuery,
    lastInGroup,
    path,
  });

  return (
    <div data-testid={testID} className={className}>
      <Button
        type="primary"
        size="small"
        title={titles?.shiftUp}
        onClick={shiftUp}
        disabled={shiftUpDisabled}>
        <CaretUpOutlined />
      </Button>
      <Button
        type="primary"
        size="small"
        title={titles?.shiftDown}
        onClick={shiftDown}
        disabled={shiftDownDisabled}>
        <CaretDownOutlined />
      </Button>
    </div>
  );
};

AntDShiftActions.displayName = 'AntDShiftActions';
