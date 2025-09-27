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
import type { MuiAugmentation } from './types';
import { useMuiComponents } from './useMuiComponents';

export * from './MaterialActionElement';
export * from './MaterialDragHandle';
export * from './MaterialNotToggle';
export * from './MaterialShiftActions';
export * from './MaterialValueEditor';
export * from './MaterialValueSelector';
export * from './RQBMaterialContext';
export * from './types';
export * from './useMuiComponents';
export { materialTranslations };

/**
 * @group Props
 */
export const materialControlElements: ControlElementsProp<FullField, string> = {
  actionElement: MaterialActionElement,
  dragHandle: MaterialDragHandle,
  notToggle: MaterialNotToggle,
  shiftActions: MaterialShiftActions,
  valueEditor: MaterialValueEditor,
  valueSelector: MaterialValueSelector,
};

const MaterialContextProvider = getCompatContextProvider({
  controlElements: materialControlElements,
  translations: materialTranslations,
});

/**
 * @group Components
 */
export const QueryBuilderMaterial: QueryBuilderContextProvider<MuiAugmentation> = ({
  muiComponents: muiComponentsProp,
  showInputLabels,
  ...props
}) => {
  const muiComponents = useMuiComponents(muiComponentsProp);

  const ctxValue = useMemo(
    () => ({ ...muiComponents, ...muiComponentsProp, showInputLabels }),
    [muiComponents, muiComponentsProp, showInputLabels]
  );

  return (
    <RQBMaterialContext.Provider value={ctxValue}>
      <MaterialContextProvider {...props} />
    </RQBMaterialContext.Provider>
  );
};
