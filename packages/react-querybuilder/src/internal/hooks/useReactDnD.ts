declare const __RQB_DEV__: boolean;

import { useEffect, useState } from 'react';
import type { DnD, UseReactDnD } from '../../types';
import { errorEnabledDndWithoutReactDnD } from '../messages';

let didWarnEnabledDndWithoutReactDnD = false;

export const useReactDnD = (dndParam?: UseReactDnD) => {
  const [dnd, setDnd] = useState<UseReactDnD | null>(dndParam ?? null);

  useEffect(() => {
    let didCancel = false;

    const getDnD = async () => {
      const [reactDnD, reactDnDHTML5Be] = await Promise.all([
        import('react-dnd').catch(() => null),
        import('react-dnd-html5-backend').catch(() => null),
      ]);

      // istanbul ignore else
      if (!didCancel) {
        if (reactDnD && reactDnDHTML5Be) {
          setDnd(() => ({ ...reactDnD, ...reactDnDHTML5Be }));
        } else {
          // istanbul ignore else
          if (__RQB_DEV__ && !didWarnEnabledDndWithoutReactDnD) {
            console.error(errorEnabledDndWithoutReactDnD);
            didWarnEnabledDndWithoutReactDnD = true;
          }
        }
      }
    };

    if (!dnd) {
      getDnD();
    }

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return dnd;
};

// istanbul ignore next
export const dndFallback: DnD = {
  hooks: {
    useDrag: (): ReturnType<UseReactDnD['useDrag']> => [
      { isDragging: false, dragMonitorId: null },
      (r: any) => r,
      (r: any) => r,
    ],
    useDrop: (): ReturnType<UseReactDnD['useDrop']> => [
      { isOver: false, dropMonitorId: null },
      (r: any) => r,
    ],
  } as Pick<UseReactDnD, 'useDrag' | 'useDrop'>,
  rule: {
    isDragging: false,
    dragMonitorId: null,
    isOver: false,
    dropMonitorId: null,
    dragRef: null,
    dndRef: null,
  },
  ruleGroup: {
    isDragging: false,
    dragMonitorId: null,
    isOver: false,
    dropMonitorId: null,
    previewRef: null,
    dragRef: null,
    dropRef: null,
  },
};
