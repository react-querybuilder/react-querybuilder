import * as React from 'react';
import type { ValueSelectorNativeProps } from '../types';
import { NativeValueSelector } from './NativeValueSelector';
import type { FullOption } from 'react-querybuilder';

/**
 * @group Components
 */
export const NativeValueSelectorWeb = <OptType extends FullOption = FullOption>(
  props: ValueSelectorNativeProps<OptType>
): React.JSX.Element => <NativeValueSelector {...props} />;
