import type { Button } from '@mui/material';
import * as React from 'react';
import type { ShiftActionsProps } from 'react-querybuilder';
import { ShiftActions, useShiftActions } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

export type MaterialShiftActionsProps = ShiftActionsProps &
  React.ComponentPropsWithoutRef<typeof Button> & {
    muiComponents?: RQBMaterialComponents;
  };

export const MaterialShiftActions = ({
  path,
  disabled,
  className,
  labels,
  titles,
  testID,
  lastInGroup,
  schema: { combinators, dispatchQuery, getQuery, ...schema },
  muiComponents: muiComponentsProp,
  ...otherProps
}: MaterialShiftActionsProps) => {
  const { shiftUp, shiftUpDisabled, shiftDown, shiftDownDisabled } = useShiftActions({
    combinators,
    disabled,
    dispatchQuery,
    getQuery,
    lastInGroup,
    path,
  });

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
        lastInGroup={lastInGroup}
        schema={{ combinators, dispatchQuery, getQuery, ...schema }}
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
        disabled={shiftUpDisabled}
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
        disabled={shiftDownDisabled}
        onClick={shiftDown}>
        {labels?.shiftDown}
      </Button>
    </div>
  );
};

MaterialShiftActions.displayName = 'MaterialShiftActions';
