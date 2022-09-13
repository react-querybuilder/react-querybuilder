import React from 'react';
import { QueryBuilder, QueryBuilderProps } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.scss';
import './QueryBuilderEmbed.scss';

export const QueryBuilderEmbed = (props: QueryBuilderProps) => {
  return (
    <div className="queryBuilderEmbed">
      <QueryBuilder {...props} />
    </div>
  );
};
