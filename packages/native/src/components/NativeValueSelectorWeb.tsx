import * as React from 'react';
import type { ValueSelectorNativeProps } from '../types';
import { NativeValueSelector } from './NativeValueSelector';
import type { FullOption } from 'react-querybuilder';

export const NativeValueSelectorWeb = <OptType extends FullOption = FullOption>(
  props: ValueSelectorNativeProps<OptType>
) => <NativeValueSelector {...props} />;
