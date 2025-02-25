import * as React from 'react';
import type { ValueEditorNativeProps } from '../types';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';

/**
 * @group Components
 */
export const NativeValueEditorWeb = (props: ValueEditorNativeProps): React.JSX.Element => (
  <NativeValueEditor {...props} selectorComponent={NativeValueSelectorWeb} />
);
