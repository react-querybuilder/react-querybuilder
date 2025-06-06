import * as React from 'react';
import type { MatchModeSelectorNativeProps } from '../types';
import { NativeMatchModeSelector } from './NativeMatchModeSelector';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';

/**
 * @group Components
 */
export const NativeMatchModeSelectorWeb = (
  props: MatchModeSelectorNativeProps
): React.JSX.Element => (
  <NativeMatchModeSelector {...props} selectorComponent={NativeValueSelectorWeb} />
);
