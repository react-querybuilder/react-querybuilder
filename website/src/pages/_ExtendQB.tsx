import BrowserOnly from '@docusaurus/BrowserOnly';
import type { RelativeDateTimeValue } from '@react-querybuilder/datetime';
import { QueryBuilderDateTime } from '@react-querybuilder/datetime/ui';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import type { RuleGroupType } from 'react-querybuilder';
import { QueryBuilder } from 'react-querybuilder';
import { dnd } from './_CustomStylesQB';
import { loading } from './_utils';
import { fields } from './demo/_constants/fields';

const thirtyYearsAgo: RelativeDateTimeValue = {
  mode: 'relative',
  anchor: 'now',
  offset: -30,
  unit: 'year',
};

const initialExtendQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
    { field: 'instrument', operator: '=', value: 'Guitar' },
    { field: 'birthdate', operator: '<', value: thirtyYearsAgo },
  ],
};

export const ExtendQB = () => (
  <BrowserOnly fallback={loading}>
    {() => (
      <QueryBuilderDnD dnd={dnd}>
        <QueryBuilderDateTime>
          <QueryBuilder fields={fields} defaultQuery={initialExtendQuery} />
        </QueryBuilderDateTime>
      </QueryBuilderDnD>
    )}
  </BrowserOnly>
);
