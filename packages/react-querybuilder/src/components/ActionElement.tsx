import * as React from 'react';
import type { ActionProps } from '../types';

/**
 * Default `<button>` component used by {@link QueryBuilder}.
 */
export const ActionElement = (props: ActionProps) => (
  <button
    type="button"
    data-testid={props.testID}
    disabled={props.disabled && !props.disabledTranslation}
    className={props.className}
    title={
      props.disabledTranslation && props.disabled ? props.disabledTranslation.title : props.title
    }
    onClick={e => props.handleOnClick(e)}>
    {props.disabledTranslation && props.disabled ? props.disabledTranslation.label : props.label}
  </button>
);
