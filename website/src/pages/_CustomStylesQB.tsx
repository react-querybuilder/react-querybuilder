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
import { loading } from './_utils';
import { initialStylingQuery } from './demo/_constants';
import { fields } from './demo/_constants/fields';

export const dnd = createPragmaticDndAdapter({
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
          defaultQuery={initialStylingQuery}
          fields={fields}
          translations={{ dragHandle: { label: '⇅' } }}
          controlClassnames={{
            queryBuilder: 'queryBuilder-neon',
          }}
        />
      </QueryBuilderDnD>
    )}
  </BrowserOnly>
);
