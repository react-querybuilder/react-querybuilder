import * as React from 'react';
import type { FullOption } from 'react-querybuilder';
import type { ValueSelectorNativeProps } from '../types';
import { NativeValueSelector } from './NativeValueSelector';

/**
 * @group Components
 */
export const NativeValueSelectorWeb = <OptType extends FullOption = FullOption>(
  props: ValueSelectorNativeProps<OptType>
): React.JSX.Element => <NativeValueSelector {...props} />;
