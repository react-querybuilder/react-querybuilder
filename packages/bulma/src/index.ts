import type { Controls, Field } from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { BulmaActionElement } from './BulmaActionElement';
import { BulmaNotToggle } from './BulmaNotToggle';
import { BulmaValueEditor } from './BulmaValueEditor';
import { BulmaValueSelector } from './BulmaValueSelector';

export * from './BulmaActionElement';
export * from './BulmaNotToggle';
export * from './BulmaValueEditor';
export * from './BulmaValueSelector';

export const bulmaControlElements = {
  notToggle: BulmaNotToggle,
  valueEditor: BulmaValueEditor,
  addGroupAction: BulmaActionElement,
  addRuleAction: BulmaActionElement,
  cloneGroupAction: BulmaActionElement,
  cloneRuleAction: BulmaActionElement,
  combinatorSelector: BulmaValueSelector,
  fieldSelector: BulmaValueSelector,
  operatorSelector: BulmaValueSelector,
  lockRuleAction: BulmaActionElement,
  lockGroupAction: BulmaActionElement,
  removeGroupAction: BulmaActionElement,
  removeRuleAction: BulmaActionElement,
  valueSourceSelector: BulmaValueSelector,
} satisfies Partial<Controls<Field, string>>;

export const QueryBuilderBulma = getCompatContextProvider({
  key: 'bulma',
  controlElements: bulmaControlElements,
});
