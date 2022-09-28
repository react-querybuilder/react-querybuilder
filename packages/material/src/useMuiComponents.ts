declare const __RQB_DEV__: boolean;

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
    const componentImports = await Promise.all([
      ['Button', (await import('@mui/material/Button')).default],
      ['Checkbox', (await import('@mui/material/Checkbox')).default],
      ['DragIndicator', (await import('@mui/icons-material/DragIndicator')).default],
      ['FormControl', (await import('@mui/material/FormControl')).default],
      ['FormControlLabel', (await import('@mui/material/FormControlLabel')).default],
      ['Input', (await import('@mui/material/Input')).default],
      ['ListSubheader', (await import('@mui/material/ListSubheader')).default],
      ['MenuItem', (await import('@mui/material/MenuItem')).default],
      ['Radio', (await import('@mui/material/Radio')).default],
      ['RadioGroup', (await import('@mui/material/RadioGroup')).default],
      ['Select', (await import('@mui/material/Select')).default],
      ['Switch', (await import('@mui/material/Switch')).default],
      ['TextareaAutosize', (await import('@mui/material/TextareaAutosize')).default],
    ] as [MuiComponentName, ComponentType<any>][]);
    componentCacheStatus = 'loaded';
    return Object.fromEntries(componentImports) as RQBMaterialComponents;
  } catch (err) {
    // TODO: should we only console.error in __RQB_DEV__ mode?
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
          /* componentCache && !__RQB_DEV__ ? componentCache : */
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

      if (!didCancel && componentImports) {
        componentCache = componentImports;
        setMuiComponents(componentImports);
      } else {
        /* istanbul ignore else */
        if (__RQB_DEV__ && !didWarnMaterialWithoutMUI) {
          console.error(errorMaterialWithoutMUI);
          didWarnMaterialWithoutMUI = true;
        }
      }
    };

    if (!muiComponents && componentCacheStatus !== 'loading' && componentCacheStatus !== 'failed') {
      getComponents();
    }

    return () => {
      didCancel = true;
    };
  }, [muiComponents]);

  return muiComponents;
};
