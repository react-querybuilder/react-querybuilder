import { TestID } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type { UndoRedoActionsProps } from '../types';
import { useQueryBuilderHistory } from './useQueryBuilderHistory';

/**
 * Default "undo"/"redo" buttons, rendered in the header of the outermost group when the
 * `showUndoRedo` prop is enabled.
 *
 * The buttons themselves are rendered with the `actionElement` control element, so they pick up
 * the same styling and behavior as every other action button—including any replacement provided
 * by a compatibility package.
 *
 * Rendering this component is what opts its query builder in to history recording, since it
 * calls {@link useQueryBuilderHistory} with the query builder's `qbId`.
 *
 * @group Components
 */
export const UndoRedoActions = (props: UndoRedoActionsProps): React.JSX.Element => {
  const { undo, redo, canUndo, canRedo } = useQueryBuilderHistory(props.schema.qbId);
  const { actionElement: ActionElementControlElement } = props.schema.controls;

  const commonSubcomponentProps = useMemo(
    () => ({
      level: props.level,
      path: props.path,
      context: props.context,
      validation: props.validation,
      schema: props.schema,
      ruleOrGroup: props.ruleOrGroup,
    }),
    [props.context, props.level, props.path, props.ruleOrGroup, props.schema, props.validation]
  );

  // `ActionProps['handleOnClick']` receives the click event, which `undo`/`redo` do not accept.
  const handleUndo = useCallback(() => undo(), [undo]);
  const handleRedo = useCallback(() => redo(), [redo]);

  return (
    <div data-testid={props.testID} className={props.className}>
      <ActionElementControlElement
        {...commonSubcomponentProps}
        testID={TestID.undoAction}
        label={props.labels?.undo}
        title={props.titles?.undo}
        className={props.classNames?.undo}
        handleOnClick={handleUndo}
        disabled={props.disabled || !canUndo}
      />
      <ActionElementControlElement
        {...commonSubcomponentProps}
        testID={TestID.redoAction}
        label={props.labels?.redo}
        title={props.titles?.redo}
        className={props.classNames?.redo}
        handleOnClick={handleRedo}
        disabled={props.disabled || !canRedo}
      />
    </div>
  );
};
