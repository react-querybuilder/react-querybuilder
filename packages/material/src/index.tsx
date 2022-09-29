import type { Controls, QueryBuilderContextProvider } from '@react-querybuilder/ts';
import { useMemo } from 'react';
import { getCompatContextProvider } from 'react-querybuilder';
import { MaterialActionElement } from './MaterialActionElement';
import { MaterialDragHandle } from './MaterialDragHandle';
import { MaterialNotToggle } from './MaterialNotToggle';
import { MaterialValueEditor } from './MaterialValueEditor';
import { MaterialValueSelector } from './MaterialValueSelector';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';
import { useMuiComponents } from './useMuiComponents';
export { version } from '../package.json';
export {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
};

export const materialControlElements: Partial<Controls> = {
  addGroupAction: MaterialActionElement,
  addRuleAction: MaterialActionElement,
  cloneGroupAction: MaterialActionElement,
  cloneRuleAction: MaterialActionElement,
  lockGroupAction: MaterialActionElement,
  lockRuleAction: MaterialActionElement,
  combinatorSelector: MaterialValueSelector,
  fieldSelector: MaterialValueSelector,
  notToggle: MaterialNotToggle,
  operatorSelector: MaterialValueSelector,
  removeGroupAction: MaterialActionElement,
  removeRuleAction: MaterialActionElement,
  valueEditor: MaterialValueEditor,
  dragHandle: MaterialDragHandle,
  valueSourceSelector: MaterialValueSelector,
};

const MaterialContextProvider = getCompatContextProvider({
  key: 'material',
  controlElements: materialControlElements,
});

export const QueryBuilderMaterial: QueryBuilderContextProvider<{
  muiComponents?: RQBMaterialComponents;
}> = ({ muiComponents: muiComponentsProp, ...props }) => {
  const muiComponents = useMuiComponents(muiComponentsProp);

  // istanbul ignore next
  const ctxValue = useMemo(
    () =>
      muiComponents && muiComponentsProp
        ? { ...muiComponents, ...muiComponentsProp }
        : muiComponents ?? muiComponentsProp ?? null,
    [muiComponents, muiComponentsProp]
  );

  return (
    <RQBMaterialContext.Provider value={ctxValue}>
      <MaterialContextProvider {...props} />
    </RQBMaterialContext.Provider>
  );
};
