import * as React from 'react';
import type { MatchModeEditorNativeProps } from '../types';
import { NativeMatchModeEditor } from './NativeMatchModeEditor';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';

/**
 * @group Components
 */
export const NativeMatchModeEditorWeb = (props: MatchModeEditorNativeProps): React.JSX.Element => (
  <NativeMatchModeEditor {...props} selectorComponent={NativeValueSelectorWeb} />
);
