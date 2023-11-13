import type {
  Combinator,
  Field,
  Operator,
  QueryBuilderProps,
  RuleGroupType,
} from 'react-querybuilder';
import { QueryBuilder } from 'react-querybuilder';
// import { QueryBuilder as QueryBuilder_v4 } from 'react-querybuilder-v4';
// import { QueryBuilder as QueryBuilder_v5 } from 'react-querybuilder-v5';
import 'react-querybuilder/dist/query-builder.scss';
import './QueryBuilderEmbed.scss';

type QueryBuilderEmbedProps<V extends 4 | 5 | 6 = 6> = QueryBuilderProps<
  RuleGroupType,
  Field,
  Operator,
  Combinator
> & {
  version?: V;
};

export const QueryBuilderEmbed = <V extends 4 | 5 | 6>(props: QueryBuilderEmbedProps<V>) => {
  // const QB: any = version === 4 ? QueryBuilder_v4 : version === 5 ? QueryBuilder_v5 : QueryBuilder;
  const QB = QueryBuilder;

  return (
    <div key={`v${props.version ?? 6}`} className="queryBuilderEmbed">
      <QB {...props} />
    </div>
  );
};
