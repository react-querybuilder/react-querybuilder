import type {
  Classnames,
  ControlElementsProp,
  FullField,
  QueryBuilderContextProvider,
} from 'react-querybuilder';
import { getCompatContextProvider } from 'react-querybuilder';
import { BulmaNotToggle } from './BulmaNotToggle';
import { BulmaValueEditor } from './BulmaValueEditor';
import { BulmaValueSelector } from './BulmaValueSelector';

export * from './BulmaNotToggle';
export * from './BulmaValueEditor';
export * from './BulmaValueSelector';

export const bulmaControlClassnames: Partial<Classnames> = {
  actionElement: 'button',
};

export const bulmaControlElements: ControlElementsProp<FullField, string> = {
  notToggle: BulmaNotToggle,
  valueEditor: BulmaValueEditor,
  valueSelector: BulmaValueSelector,
};

export const QueryBuilderBulma: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: bulmaControlElements,
  controlClassnames: bulmaControlClassnames,
});
