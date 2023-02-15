declare const __RQB_DEV__: boolean;

import { useEffect } from 'react';
import { errorEnabledDndWithoutReactDnD } from '../../messages';

let didWarnEnabledDndWithoutReactDnD = false;

export const useReactDndWarning = (enableDragAndDrop: boolean, dndRefs: boolean) => {
  useEffect(() => {
    if (__RQB_DEV__ && !didWarnEnabledDndWithoutReactDnD && enableDragAndDrop && !dndRefs) {
      console.error(errorEnabledDndWithoutReactDnD);
      didWarnEnabledDndWithoutReactDnD = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
