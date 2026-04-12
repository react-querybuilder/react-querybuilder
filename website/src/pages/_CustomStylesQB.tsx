import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createPragmaticDndAdapter } from '@react-querybuilder/dnd/pragmatic-dnd';
import { QueryBuilder } from 'react-querybuilder';
import { Loading } from './_utils';
import { initialQuery } from './demo/_constants';
import { fields } from './demo/_constants/fields';

const dnd = createPragmaticDndAdapter({
  draggable,
  dropTargetForElements,
  monitorForElements,
  combine,
});

const loading = <Loading />;

export const CustomStylesQB = () => (
  <BrowserOnly fallback={loading}>
    {() => (
      <QueryBuilderDnD dnd={dnd}>
        <QueryBuilder
          defaultQuery={initialQuery}
          fields={fields}
          translations={{ dragHandle: { label: '⇅' } }}
          controlClassnames={{
            queryBuilder: ['queryBuilder-branches', 'green-branch-lines'],
          }}
        />
      </QueryBuilderDnD>
    )}
  </BrowserOnly>
);
