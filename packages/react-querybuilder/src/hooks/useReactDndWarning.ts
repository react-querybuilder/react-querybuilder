import { messages } from '../messages';

let didWarnEnabledDndWithoutReactDnD = false;

/**
 * Logs a warning if drag-and-drop is enabled but the required dependencies
 * (`react-dnd` and either `react-dnd-html5-backend` or `react-dnd-touch-backend`)
 * were not detected.
 *
 * @group Hooks
 */
export const useReactDndWarning = (enableDragAndDrop: boolean, dndRefs: boolean): void => {
  if (
    process.env.NODE_ENV !== 'production' &&
    !didWarnEnabledDndWithoutReactDnD &&
    enableDragAndDrop &&
    !dndRefs
  ) {
    console.error(messages.errorEnabledDndWithoutReactDnD);
    didWarnEnabledDndWithoutReactDnD = true;
  }
};
