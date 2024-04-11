import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { useReducer, useState } from 'react';
import {
  QueryBuilder,
  defaultValidator,
  formatQuery,
} from 'react-querybuilder';
import { fields } from './fields';
import { initialQuery, initialQueryIC } from './initialQuery';
import './styles.scss';
import {
  defaultOptions,
  jsonataRuleProcessor,
  optionsOrder,
  optionsReducer,
} from './utils';

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

  const queryForFormatting = independentCombinators ? queryIC : query;

  return (
    <div>
      <QueryBuilderDnD
        controlClassnames={{
          queryBuilder: showBranches ? 'queryBuilder-branches' : '',
        }}>
        {independentCombinators ? (
          <QueryBuilder
            key="rqb-ic"
            {...commonOptions}
            fields={fields}
            parseNumbers={parseNumbers}
            validator={useValidation ? defaultValidator : undefined}
            query={queryIC}
            onQueryChange={setQueryIC as (q: typeof queryIC) => void}
          />
        ) : (
          <QueryBuilder
            key="rqb"
            {...commonOptions}
            fields={fields}
            parseNumbers={parseNumbers}
            validator={useValidation ? defaultValidator : undefined}
            query={query}
            onQueryChange={setQuery as (q: typeof query) => void}
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
      <h5>JSONata</h5>
      <pre>
        {formatQuery(queryForFormatting, {
          format: 'jsonata',
          parseNumbers: true,
          ruleProcessor: jsonataRuleProcessor,
        })}
      </pre>
      <h5>ElasticSearch</h5>
      <pre>
        {JSON.stringify(
          formatQuery(queryForFormatting, {
            format: 'elasticsearch',
            parseNumbers,
          }),
          null,
          2
        )}
      </pre>
    </div>
  );
};
