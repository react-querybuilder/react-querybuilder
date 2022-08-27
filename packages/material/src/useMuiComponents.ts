declare const __RQB_DEV__: boolean;

import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { nullFreeArray } from 'react-querybuilder';
import { errorMaterialWithoutMUI } from './messages';
import type { MuiComponentName, RQBMaterialComponents } from './types';

let didWarnMaterialWithoutMUI = false;

const componentCache = new Map<MuiComponentName, ComponentType<any>>();

/**
 * Returns the promise of a MUI component. I'd rather do something like this:
 *
 *     const importMuiComponent = (componentName: MuiComponentName) =>
 *       import(`@mui/material/${componentName}`)
 *         .then(c => c.default)
 *         .catch(() => null);
 *
 * instead of naming all the components individually, but using template strings
 * seems to throw off TypeScript as well as the execution.
 */
const importMuiComponent = (componentName: MuiComponentName) => {
  let comp: Promise<{ default: ComponentType<any> }>;
  switch (componentName) {
    case 'Button':
      comp = import('@mui/material/Button');
      break;
    case 'Checkbox':
      comp = import('@mui/material/Checkbox');
      break;
    case 'DragIndicator':
      comp = import('@mui/icons-material/DragIndicator');
      break;
    case 'FormControl':
      comp = import('@mui/material/FormControl');
      break;
    case 'FormControlLabel':
      comp = import('@mui/material/FormControlLabel');
      break;
    case 'Input':
      comp = import('@mui/material/Input');
      break;
    case 'ListSubheader':
      comp = import('@mui/material/ListSubheader');
      break;
    case 'MenuItem':
      comp = import('@mui/material/MenuItem');
      break;
    case 'Radio':
      comp = import('@mui/material/Radio');
      break;
    case 'RadioGroup':
      comp = import('@mui/material/RadioGroup');
      break;
    case 'Select':
      comp = import('@mui/material/Select');
      break;
    case 'Switch':
      comp = import('@mui/material/Switch');
      break;
    case 'TextareaAutosize':
      comp = import('@mui/material/TextareaAutosize');
      break;
  }

  return comp.then(c => c.default).catch(/* istanbul ignore next */ () => null);
};

export const useMuiComponents = (
  componentNames: MuiComponentName[],
  preloadedComponents?: Partial<RQBMaterialComponents>
) => {
  const [muiComponents, setMuiComponents] = useState<Partial<RQBMaterialComponents> | null>(
    preloadedComponents ?? null
  );

  useEffect(() => {
    let didCancel = false;

    const getComponents = async () => {
      const missingComponentsAtStart = componentNames.filter(name => !componentCache.has(name));
      const componentImports = await Promise.all(
        missingComponentsAtStart.map(name => importMuiComponent(name))
      );

      // istanbul ignore else
      if (!didCancel) {
        if (nullFreeArray(componentImports)) {
          const missingComponentsAfterImports = componentNames.filter(
            name => !componentCache.has(name)
          );
          const components: Partial<RQBMaterialComponents> = {};
          missingComponentsAfterImports.forEach((name, idx) => {
            componentCache.set(name, componentImports[idx]);
          });
          componentCache.forEach((c, name) => {
            if (componentNames.includes(name)) {
              // TODO: Remove `as any`
              components[name] = c as any;
            }
          });
          setMuiComponents(comps => ({ ...comps, ...components }));
        } else {
          // istanbul ignore else
          if (__RQB_DEV__ && !didWarnMaterialWithoutMUI) {
            console.error(errorMaterialWithoutMUI);
            didWarnMaterialWithoutMUI = true;
          }
        }
      }
    };

    if (!muiComponents) {
      getComponents();
    }

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return muiComponents;
};
