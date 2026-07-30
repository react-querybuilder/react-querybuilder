import { messages } from '../messages';

let didWarnShowUndoRedoWithoutProvider = false;

/**
 * Logs a warning if the `showUndoRedo` prop is enabled but no undo/redo controls are available,
 * which generally means the query builder was not wrapped in the `QueryBuilderHistory` component
 * from `react-querybuilder/history`.
 *
 * @group Hooks
 */
export const useUndoRedoWarning = (showUndoRedo: boolean, hasUndoRedoControls: boolean): void => {
  if (
    process.env.NODE_ENV !== 'production' &&
    !didWarnShowUndoRedoWithoutProvider &&
    showUndoRedo &&
    !hasUndoRedoControls
  ) {
    console.error(messages.errorShowUndoRedoWithoutProvider);
    didWarnShowUndoRedoWithoutProvider = true;
  }
};
