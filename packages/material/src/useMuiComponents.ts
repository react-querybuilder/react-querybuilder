/* istanbul ignore file */

/**
 * TODO: We should not ignore this entire file with regard to
 * test coverage, but testing dynamic imports is hard so it's
 * future us's problem for now.
 */

declare const __RQB_DEV__: boolean;

import type { ComponentType } from 'react';
import { useContext, useEffect, useState } from 'react';
import { nullFreeArray, objectKeys } from 'react-querybuilder';
import { errorMaterialWithoutMUI } from './messages';
import { RQBMaterialContext } from './RQBMaterialContext';
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
  const muiComponentsFromContext = useContext(RQBMaterialContext);

  const cachedComponents: Partial<RQBMaterialComponents> | null =
    componentCache.size === 0 ? null : Object.fromEntries(componentCache);

  const initialComponents =
    muiComponentsFromContext && preloadedComponents
      ? {
          ...muiComponentsFromContext,
          ...preloadedComponents,
          ...cachedComponents,
        }
      : preloadedComponents
      ? { ...preloadedComponents, ...cachedComponents }
      : muiComponentsFromContext
      ? { ...muiComponentsFromContext, ...cachedComponents }
      : /* TODO: why does this next line cause the app to crash? */
        /* cachedComponents && !__RQB_DEV__ ? cachedComponents : */
        null;
  const [muiComponents, setMuiComponents] = useState<Partial<RQBMaterialComponents> | null>(
    initialComponents
  );

  useEffect(() => {
    let didCancel = false;

    const missingComponentsAtStart = componentNames.filter(name => !componentCache.has(name));

    const getComponents = async () => {
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

    if (missingComponentsAtStart.length === 0) {
      return;
    } else if (
      !muiComponents ||
      !componentNames.every(name => objectKeys(muiComponents).includes(name))
    ) {
      getComponents();
    }

    if (muiComponents && !componentNames.every(name => componentCache.has(name))) {
      const missingComponentsFromCache = componentNames.filter(name => !componentCache.has(name));
      missingComponentsFromCache.forEach(name => {
        // TODO: Remove `as any`
        componentCache.set(name, muiComponents[name] as any);
      });
    }

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return muiComponents;
};
