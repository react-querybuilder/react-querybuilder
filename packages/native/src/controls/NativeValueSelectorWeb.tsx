import type { ValueSelectorNativeProps } from '../types';
import { NativeValueSelector } from './NativeValueSelector';

export const NativeValueSelectorWeb = (props: ValueSelectorNativeProps) => (
  <NativeValueSelector {...props} />
);

NativeValueSelectorWeb.displayName = 'NativeValueSelectorWeb';
