import { useEffect } from 'react';
import { errorEnabledDndWithoutReactDnD } from '../messages';

let didWarnEnabledDndWithoutReactDnD = false;

/**
 * Logs a warning if drag-and-drop is enabled but the required dependencies
 * (`react-dnd` and `react-dnd-html5-backend`) were not detected.
 */
export const useReactDndWarning = (enableDragAndDrop: boolean, dndRefs: boolean) => {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      !didWarnEnabledDndWithoutReactDnD &&
      enableDragAndDrop &&
      !dndRefs
    ) {
      console.error(errorEnabledDndWithoutReactDnD);
      didWarnEnabledDndWithoutReactDnD = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
