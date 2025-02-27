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

/**
 * @group Props
 */

export const bulmaControlClassnames: Partial<Classnames> = {
  actionElement: 'button',
};

/**
 * @group Props
 */
export const bulmaControlElements: ControlElementsProp<FullField, string> = {
  notToggle: BulmaNotToggle,
  valueEditor: BulmaValueEditor,
  valueSelector: BulmaValueSelector,
};

/**
 * @group Components
 */
export const QueryBuilderBulma: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: bulmaControlElements,
  controlClassnames: bulmaControlClassnames,
});
