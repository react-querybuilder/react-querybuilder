import React from 'react';
import type { QueryBuilderProps } from 'react-querybuilder';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilder as QueryBuilder_v4 } from 'react-querybuilder-v4';
import 'react-querybuilder/dist/query-builder.scss';
import './QueryBuilderEmbed.scss';

type QueryBuilderEmbedProps<V extends 4 | 5 = 5> = QueryBuilderProps<any> & {
  version?: V;
};

export const QueryBuilderEmbed = <V extends 4 | 5>({
  version,
  ...props
}: QueryBuilderEmbedProps<V>) => {
  const QB = version === 4 ? QueryBuilder_v4 : QueryBuilder;
  return (
    <div key={`v${version ?? 5}`} className="queryBuilderEmbed">
      <QB {...props} />
    </div>
  );
};
