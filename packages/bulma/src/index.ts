import type { Controls, FullField } from 'react-querybuilder';
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
  actionElement: BulmaActionElement,
  notToggle: BulmaNotToggle,
  valueEditor: BulmaValueEditor,
  valueSelector: BulmaValueSelector,
} satisfies Partial<Controls<FullField, string>>;

export const QueryBuilderBulma = getCompatContextProvider({
  key: 'bulma',
  controlElements: bulmaControlElements,
});
