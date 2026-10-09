import type * as Core from '@react-querybuilder/core';
import type * as ParseSQL from '@react-querybuilder/core/parseSQL';
import type * as DateTimeUI from '@react-querybuilder/datetime/ui';
import type * as DnD from '@react-querybuilder/dnd';
import type * as Mantine from '@react-querybuilder/mantine';
// Ambient names used by skill snippet fragments (e.g. `<QueryBuilder fields={fields} />` with no
// imports). Snippet-local declarations/imports shadow these.
import type * as React from 'react';
import type * as RQB from 'react-querybuilder';

declare global {
  // Types
  type Field = RQB.Field;
  type RuleType = RQB.RuleType;
  type RuleGroupType = RQB.RuleGroupType;
  type RuleGroupTypeIC = RQB.RuleGroupTypeIC;
  type RuleGroupTypeAny = RQB.RuleGroupTypeAny;

  // React
  const useState: typeof React.useState;

  // RQB values
  const QueryBuilder: typeof RQB.QueryBuilder;
  const formatQuery: typeof Core.formatQuery;
  const defaultValidator: typeof Core.defaultValidator;
  const parseSQL: typeof ParseSQL.parseSQL;
  const QueryBuilderMantine: typeof Mantine.QueryBuilderMantine;
  const QueryBuilderDateTime: typeof DateTimeUI.QueryBuilderDateTime;
  const QueryBuilderDnD: typeof DnD.QueryBuilderDnD;

  // App-provided values
  const fields: RQB.Field[];
  const fieldNames: ReadonlySet<string>;
  const query: RQB.RuleGroupType;
  const setQuery: React.Dispatch<React.SetStateAction<RQB.RuleGroupType>>;
  const input: string;
  const savedWhereClause: string;
  const dndAdapter: DnD.DndAdapter;
  const assertSafeQuery: (rg: RQB.RuleGroupTypeAny, fieldNames: ReadonlySet<string>) => void;
  const db: { query: (sql: string, params?: unknown[]) => Promise<unknown> };
}
