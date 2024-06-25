import * as React from 'react';
import { useMemo } from 'react';
import type {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { MaterialActionElement } from './MaterialActionElement';
import { MaterialDragHandle } from './MaterialDragHandle';
import { MaterialNotToggle } from './MaterialNotToggle';
import { MaterialShiftActions } from './MaterialShiftActions';
import { MaterialValueEditor } from './MaterialValueEditor';
import { MaterialValueSelector } from './MaterialValueSelector';
import { RQBMaterialContext } from './RQBMaterialContext';
import { materialTranslations } from './translations';
import type { RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';

export * from './MaterialActionElement';
export * from './MaterialDragHandle';
export * from './MaterialNotToggle';
export * from './MaterialShiftActions';
export * from './MaterialValueEditor';
export * from './MaterialValueSelector';
export * from './RQBMaterialContext';
export type { RQBMaterialComponents } from './types';
export * from './useMuiComponents';
export { materialTranslations };

export const materialControlElements = {
  actionElement: MaterialActionElement,
  dragHandle: MaterialDragHandle,
  notToggle: MaterialNotToggle,
  shiftActions: MaterialShiftActions,
  valueEditor: MaterialValueEditor,
  valueSelector: MaterialValueSelector,
} satisfies ControlElementsProp<FullField, string>;

const MaterialContextProvider = getCompatContextProvider({
  controlElements: materialControlElements,
  translations: materialTranslations,
});

export const QueryBuilderMaterial: QueryBuilderContextProvider<{
  muiComponents?: RQBMaterialComponents;
}> = ({ muiComponents: muiComponentsProp, ...props }) => {
  const muiComponents = useMuiComponents(muiComponentsProp);

  const ctxValue = useMemo(
    () => ({ ...muiComponents, ...muiComponentsProp }),
    [muiComponents, muiComponentsProp]
  );

  return (
    <RQBMaterialContext.Provider value={ctxValue}>
      <MaterialContextProvider {...props} />
    </RQBMaterialContext.Provider>
  );
};
