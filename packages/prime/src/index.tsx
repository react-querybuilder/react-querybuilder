import * as React from 'react';
import type {
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
  Translations,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { PrimeActionElement } from './PrimeActionElement';
import { PrimeDragHandle } from './PrimeDragHandle';
import { PrimeNotToggle } from './PrimeNotToggle';
import { PrimeShiftActions } from './PrimeShiftActions';
import { PrimeValueEditor } from './PrimeValueEditor';
import { PrimeValueSelector } from './PrimeValueSelector';

export * from './PrimeActionElement';
export * from './PrimeDragHandle';
export * from './PrimeNotToggle';
export * from './PrimeShiftActions';
export * from './PrimeValueEditor';
export * from './PrimeValueSelector';

/**
 * @group Props
 */
export const primeControlElements: ControlElementsProp<FullField, string> = {
  actionElement: PrimeActionElement,
  dragHandle: PrimeDragHandle,
  notToggle: PrimeNotToggle,
  shiftActions: PrimeShiftActions,
  valueEditor: PrimeValueEditor,
  valueSelector: PrimeValueSelector,
};

/**
 * @group Props
 */
export const primeTranslations: Partial<Translations> = {
  removeGroup: { label: <i className="pi pi-times" /> },
  removeRule: { label: <i className="pi pi-times" /> },
  cloneRule: { label: <i className="pi pi-copy" /> },
  cloneRuleGroup: { label: <i className="pi pi-copy" /> },
  lockGroup: { label: <i className="pi pi-lock-open" /> },
  lockRule: { label: <i className="pi pi-lock-open" /> },
  lockGroupDisabled: { label: <i className="pi pi-lock" /> },
  lockRuleDisabled: { label: <i className="pi pi-lock" /> },
  shiftActionUp: { label: <i className="pi pi-chevron-up" /> },
  shiftActionDown: { label: <i className="pi pi-chevron-down" /> },
};

/**
 * @group Components
 */
export const QueryBuilderPrime: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: primeControlElements,
  translations: primeTranslations,
});
