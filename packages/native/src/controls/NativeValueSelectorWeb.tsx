import PickerWeb from '@react-native-picker/picker/dist/module/Picker.web.js';
import type { ValueSelectorNativeProps } from '../types';
import { NativeValueSelector } from './NativeValueSelector';

export const NativeValueSelectorWeb = ({
  pickerComponent = PickerWeb,
  ...props
}: ValueSelectorNativeProps) => (
  <NativeValueSelector {...props} pickerComponent={pickerComponent} />
);

NativeValueSelectorWeb.displayName = 'NativeValueSelectorWeb';
