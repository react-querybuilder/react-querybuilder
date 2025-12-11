import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import * as ReactDndTouchBackend from 'react-dnd-touch-backend';
import { QueryBuilder } from 'react-querybuilder';
import { Loading } from './_utils';
import { initialQuery } from './demo/_constants';
import { fields } from './demo/_constants/fields';

const loading = <Loading />;

export const CustomStylesQB = () => (
  <BrowserOnly fallback={loading}>
    {() => (
      <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend, ...ReactDndTouchBackend }}>
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
