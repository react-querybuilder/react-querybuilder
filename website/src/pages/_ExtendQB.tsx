import BrowserOnly from '@docusaurus/BrowserOnly';
import type { RelativeDateTimeValue } from '@react-querybuilder/datetime';
import { QueryBuilderDateTime } from '@react-querybuilder/datetime/ui';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { QueryBuilderExpressions } from '@react-querybuilder/expr/ui';
import type { RuleGroupType } from 'react-querybuilder';
import { defaultOperators, QueryBuilder } from 'react-querybuilder';
import { dnd } from './_CustomStylesQB';
import { loading } from './_utils';
import { fields } from './demo/_constants/fields';

const fieldsWithExpressions = fields.map(f =>
  f.value === 'firstName' ? Object.assign(f, { valueSources: ['value', 'expression'] }) : f
);

const exprOperators = defaultOperators.filter(o => !o.value.startsWith('doesNot'));

const thirtyYearsAgo: RelativeDateTimeValue = {
  mode: 'relative',
  anchor: 'now',
  offset: -30,
  unit: 'year',
};

const initialExtendQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'firstName',
      operator: 'beginsWith',
      value: 'S',
      lhs: { kind: 'func', fn: 'upper', args: [{ kind: 'field', field: 'firstName' }] },
    },
    {
      field: 'lastName',
      operator: '=',
      value: 'vaughan',
      lhs: { kind: 'func', fn: 'lower', args: [{ kind: 'field', field: 'lastName' }] },
    },
    { field: 'instrument', operator: '=', value: 'Guitar' },
    { field: 'birthdate', operator: '<', value: thirtyYearsAgo },
  ],
};

export const ExtendQB = () => (
  <BrowserOnly fallback={loading}>
    {() => (
      <QueryBuilderDnD dnd={dnd}>
        <QueryBuilderDateTime>
          <QueryBuilderExpressions allowFunctionsOnLHS>
            <QueryBuilder
              fields={fieldsWithExpressions}
              defaultQuery={initialExtendQuery}
              operators={exprOperators}
            />
          </QueryBuilderExpressions>
        </QueryBuilderDateTime>
      </QueryBuilderDnD>
    )}
  </BrowserOnly>
);
