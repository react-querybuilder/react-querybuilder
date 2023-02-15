import type { ValueEditorNativeProps } from '../types';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';

export const NativeValueEditorWeb = (props: ValueEditorNativeProps) => (
  <NativeValueEditor {...props} selectorComponent={NativeValueSelectorWeb} />
);
