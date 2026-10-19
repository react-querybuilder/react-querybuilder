import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createPragmaticDndAdapter } from '@react-querybuilder/dnd/pragmatic-dnd';
import { BrowserOnly } from '@site/src/compat';
import { initialQuery } from '@site/src/demo/constants';
import { fields } from '@site/src/demo/constants/fields';
import { loading } from '@site/src/demo/utils';
import { QueryBuilder } from 'react-querybuilder';

const dnd = createPragmaticDndAdapter({
  draggable,
  dropTargetForElements,
  monitorForElements,
  combine,
});

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
