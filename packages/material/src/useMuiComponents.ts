import { useContext, useEffect, useMemo, useState } from 'react';
import { errorMaterialWithoutMUI } from './messages';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

let didWarnMaterialWithoutMUI = false;

export type ComponentCacheStatus = 'initial' | 'loading' | 'loaded' | 'failed';
export let componentCacheStatus: ComponentCacheStatus = 'initial';
export let componentCache: RQBMaterialComponents | null = null;

/**
 * Returns a promise of all the necessary MUI components.
 */
const importMuiComponents = async () => {
  componentCacheStatus = 'loading';
  const componentImports = Promise.all([import('@mui/icons-material'), import('@mui/material')])
    .then(
      ([
        { DragIndicator },
        {
          Button,
          Checkbox,
          FormControl,
          FormControlLabel,
          Input,
          ListSubheader,
          MenuItem,
          Radio,
          RadioGroup,
          Select,
          Switch,
          TextareaAutosize,
        },
      ]): RQBMaterialComponents => {
        componentCacheStatus = 'loaded';
        return {
          Button,
          Checkbox,
          DragIndicator,
          FormControl,
          FormControlLabel,
          Input,
          ListSubheader,
          MenuItem,
          Radio,
          RadioGroup,
          Select,
          Switch,
          TextareaAutosize,
        };
      }
    )
    .catch(
      // TODO: should we console.error only when NODE_ENV !== 'production'?
      reason => {
        console.error(reason);
        componentCacheStatus = 'failed';
        return null;
      }
    );
  return componentImports;
};

export const useMuiComponents = (
  preloadedComponents?: RQBMaterialComponents
): RQBMaterialComponents | null => {
  const muiComponentsFromContext = useContext(RQBMaterialContext);

  const initialComponents = useMemo(
    () =>
      preloadedComponents && muiComponentsFromContext
        ? {
            ...componentCache,
            ...muiComponentsFromContext,
            ...preloadedComponents,
          }
        : preloadedComponents
        ? { ...componentCache, ...preloadedComponents }
        : muiComponentsFromContext
        ? { ...componentCache, ...muiComponentsFromContext }
        : /* TODO: why does this next line cause the app to crash? */
          /* componentCache && process.env.NODE_ENV === 'production' ? componentCache : */
          componentCache,
    [muiComponentsFromContext, preloadedComponents]
  );

  const [muiComponents, setMuiComponents] = useState<RQBMaterialComponents | null>(
    initialComponents
  );

  useEffect(() => {
    let didCancel = false;

    const getComponents = async () => {
      const componentImports = await importMuiComponents();

      /* istanbul ignore else */
      if (!didCancel) {
        if (componentImports) {
          componentCache = componentImports;
          setMuiComponents(componentImports);
        } else {
          /* istanbul ignore else */
          if (process.env.NODE_ENV !== 'production' && !didWarnMaterialWithoutMUI) {
            console.error(errorMaterialWithoutMUI);
            didWarnMaterialWithoutMUI = true;
          }
        }
      }
    };

    if (!muiComponents && componentCacheStatus !== 'loading' && componentCacheStatus !== 'failed') {
      getComponents();
    }

    return () => {
      didCancel = true;
      componentCacheStatus = 'initial';
    };
  }, [muiComponents]);

  return muiComponents;
};
