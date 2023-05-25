import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { useReducer, useState } from 'react';
import type {
  DefaultRuleGroupType,
  QueryBuilderProps,
} from 'react-querybuilder';
import {
  QueryBuilder,
  defaultValidator,
  formatQuery,
} from 'react-querybuilder';
import { fields } from './fields';
import { initialQuery, initialQueryIC } from './initialQuery';
import './styles.scss';
import type {
  DefaultQBPropsNoDefaultQuery,
  DefaultQBPropsNoDefaultQueryIC,
} from './types';
import { defaultOptions, optionsOrder, optionsReducer } from './utils';

export const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [options, dispatch] = useReducer(optionsReducer, defaultOptions);
  const {
    useValidation,
    independentCombinators,
    parseNumbers,
    showBranches,
    ...commonOptions
  } = options;
  const commonProps: QueryBuilderProps<DefaultRuleGroupType> = {
    fields,
    ...commonOptions,
    parseNumbers,
    validator: useValidation ? defaultValidator : undefined,
  };

  const queryForFormatting = independentCombinators ? queryIC : query;

  return (
    <div>
      <QueryBuilderDnD
        controlClassnames={{
          queryBuilder: showBranches ? 'queryBuilder-branches' : '',
        }}>
        {independentCombinators ? (
          <QueryBuilder
            {...(commonProps as unknown as DefaultQBPropsNoDefaultQueryIC)}
            key="rqb-ic"
            independentCombinators
            query={queryIC}
            onQueryChange={qIC => setQueryIC(qIC)}
          />
        ) : (
          <QueryBuilder
            {...(commonProps as DefaultQBPropsNoDefaultQuery)}
            key="rqb"
            independentCombinators={false}
            query={query}
            onQueryChange={q => setQuery(q)}
          />
        )}
      </QueryBuilderDnD>
      <div>
        {optionsOrder.map(optionName => (
          <label key={optionName}>
            <input
              type="checkbox"
              checked={options[optionName]}
              onChange={e =>
                dispatch({
                  type: 'update',
                  payload: { optionName, value: e.target.checked },
                })
              }
            />
            {optionName}
          </label>
        ))}
      </div>
      <h5>
        JSON (without <code>id</code>s)
      </h5>
      <pre>
        {JSON.stringify(
          JSON.parse(
            formatQuery(queryForFormatting, {
              format: 'json_without_ids',
              parseNumbers,
            })
          ),
          null,
          2
        )}
      </pre>
      <h5>Parameterized SQL</h5>
      <pre>
        {JSON.stringify(
          formatQuery(queryForFormatting, {
            format: 'parameterized',
            parseNumbers,
          }),
          null,
          2
        )}
      </pre>
      <h5>Parameterized (Named) SQL</h5>
      <pre>
        {JSON.stringify(
          formatQuery(queryForFormatting, {
            format: 'parameterized_named',
            parseNumbers,
          }),
          null,
          2
        )}
      </pre>
      <h5>SQL</h5>
      <pre>
        {formatQuery(queryForFormatting, { format: 'sql', parseNumbers })}
      </pre>
      <h5>MongoDB</h5>
      <pre>
        {formatQuery(queryForFormatting, { format: 'mongodb', parseNumbers })}
      </pre>
      <h5>CEL</h5>
      <pre>
        {formatQuery(queryForFormatting, { format: 'cel', parseNumbers })}
      </pre>
      <h5>SpEL</h5>
      <pre>
        {formatQuery(queryForFormatting, { format: 'spel', parseNumbers })}
      </pre>
      <h5>JsonLogic</h5>
      <pre>
        {JSON.stringify(
          formatQuery(queryForFormatting, {
            format: 'jsonlogic',
            parseNumbers,
          }),
          null,
          2
        )}
      </pre>
    </div>
  );
};
