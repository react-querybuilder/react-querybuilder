import type { ComponentType } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { errorMaterialWithoutMUI } from './messages';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { MuiComponentName, RQBMaterialComponents } from './types';

let didWarnMaterialWithoutMUI = false;

export type ComponentCacheStatus = 'initial' | 'loading' | 'loaded' | 'failed';
export let componentCacheStatus: ComponentCacheStatus = 'initial';
export let componentCache: RQBMaterialComponents | null = null;

/**
 * Returns a promise of all the necessary MUI components.
 */
const importMuiComponents = async () => {
  componentCacheStatus = 'loading';
  try {
    const componentPromise = Promise.all([
      ['Button', (await import('@mui/material/Button/index.js')).default],
      ['Checkbox', (await import('@mui/material/Checkbox/index.js')).default],
      ['DragIndicator', (await import('@mui/icons-material/DragIndicator.js')).default],
      ['FormControl', (await import('@mui/material/FormControl/index.js')).default],
      ['FormControlLabel', (await import('@mui/material/FormControlLabel/index.js')).default],
      ['Input', (await import('@mui/material/Input/index.js')).default],
      ['ListSubheader', (await import('@mui/material/ListSubheader/index.js')).default],
      ['MenuItem', (await import('@mui/material/MenuItem/index.js')).default],
      ['Radio', (await import('@mui/material/Radio/index.js')).default],
      ['RadioGroup', (await import('@mui/material/RadioGroup/index.js')).default],
      ['Select', (await import('@mui/material/Select/index.js')).default],
      ['Switch', (await import('@mui/material/Switch/index.js')).default],
      ['TextareaAutosize', (await import('@mui/material/TextareaAutosize/index.js')).default],
    ] as [MuiComponentName, ComponentType<any>][]);
    // istanbul ignore next
    // TODO: should we console.error only when NODE_ENV !== 'production'?
    componentPromise.catch(reason => console.error(reason));
    const componentImports = await componentPromise;
    componentCacheStatus = 'loaded';
    return Object.fromEntries(componentImports) as RQBMaterialComponents;
  } catch (err) {
    // TODO: should we console.error only when NODE_ENV !== 'production'?
    console.error(err);
    componentCacheStatus = 'failed';
  }

  return null;
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
