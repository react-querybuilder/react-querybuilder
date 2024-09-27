import type { Button } from '@mui/material';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';
import { ShiftActions } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

export type MaterialShiftActionsProps = ShiftActionsProps &
  React.ComponentPropsWithoutRef<typeof Button> & {
    muiComponents?: RQBMaterialComponents;
  };

export const MaterialShiftActions = ({
  path,
  shiftUp,
  shiftDown,
  shiftUpDisabled,
  shiftDownDisabled,
  disabled,
  className,
  labels,
  titles,
  testID,
  muiComponents: muiComponentsProp,
  ...otherProps
}: MaterialShiftActionsProps): React.JSX.Element => {
  const muiComponents = React.useContext(RQBMaterialContext) ?? muiComponentsProp;
  const key = muiComponents ? 'mui' : 'no-mui';
  if (!muiComponents) {
    return (
      <ShiftActions
        key={key}
        path={path}
        disabled={disabled}
        className={className}
        labels={labels}
        titles={titles}
        testID={testID}
        shiftUp={shiftUp}
        shiftDown={shiftDown}
        shiftUpDisabled={shiftUpDisabled}
        shiftDownDisabled={shiftDownDisabled}
        {...otherProps}
      />
    );
  }

  const { Button } = muiComponents;

  return (
    <div key={key} data-testid={testID} className={className}>
      <Button
        sx={{ boxShadow: 'none' }}
        variant="contained"
        color="secondary"
        className={className}
        title={titles?.shiftUp}
        size="small"
        disabled={disabled || shiftUpDisabled}
        onClick={shiftUp}>
        {labels?.shiftUp}
      </Button>
      <Button
        sx={{ boxShadow: 'none' }}
        variant="contained"
        color="secondary"
        className={className}
        title={titles?.shiftDown}
        size="small"
        disabled={disabled || shiftDownDisabled}
        onClick={shiftDown}>
        {labels?.shiftDown}
      </Button>
    </div>
  );
};
