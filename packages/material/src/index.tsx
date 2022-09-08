import type {
  Controls,
  QueryBuilderContextProvider,
  QueryBuilderContextProviderProps,
} from '@react-querybuilder/ts';
import { getCompatContextProvider } from 'react-querybuilder';
import { MaterialActionElement } from './MaterialActionElement';
import { MaterialDragHandle } from './MaterialDragHandle';
import { MaterialNotToggle } from './MaterialNotToggle';
import { MaterialValueEditor } from './MaterialValueEditor';
import { MaterialValueSelector } from './MaterialValueSelector';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { MuiComponentName, RQBMaterialComponents } from './types';
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

const allMuiComponentNames: MuiComponentName[] = [
  'Button',
  'Checkbox',
  'DragIndicator',
  'FormControl',
  'FormControlLabel',
  'Input',
  'ListSubheader',
  'MenuItem',
  'Radio',
  'RadioGroup',
  'Select',
  'Switch',
  'TextareaAutosize',
];

export const QueryBuilderMaterial: QueryBuilderContextProvider = ({
  muiComponents = {},
  ...props
}: QueryBuilderContextProviderProps & {
  muiComponents?: Partial<RQBMaterialComponents>;
}) => {
  const muiComponentsInternal = useMuiComponents(allMuiComponentNames, muiComponents);

  // istanbul ignore next
  const ctxValue =
    muiComponentsInternal && muiComponents
      ? { ...muiComponentsInternal, ...muiComponents }
      : muiComponentsInternal
      ? muiComponentsInternal
      : muiComponents
      ? muiComponents
      : null;

  return (
    <RQBMaterialContext.Provider value={ctxValue}>
      <MaterialContextProvider {...props} />
    </RQBMaterialContext.Provider>
  );
};
