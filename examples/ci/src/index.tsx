import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  defaultValidator,
  formatQuery,
  QueryBuilder,
  QueryBuilderProps,
} from 'react-querybuilder';
import { fields } from './fields';
import './index.scss';
import { initialQuery, initialQueryIC } from './initialQuery';

const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [showCombinatorsBetweenRules, setShowCombinatorsBetweenRules] = useState(false);
  const [showNotToggle, setShowNotToggle] = useState(false);
  const [showCloneButtons, setShowCloneButtons] = useState(false);
  const [resetOnFieldChange, setResetOnFieldChange] = useState(true);
  const [resetOnOperatorChange, setResetOnOperatorChange] = useState(false);
  const [autoSelectField, setAutoSelectField] = useState(true);
  const [autoSelectOperator, setAutoSelectOperator] = useState(true);
  const [addRuleToNewGroups, setAddRuleToNewGroups] = useState(false);
  const [useValidation, setUseValidation] = useState(false);
  const [independentCombinators, setIndependentCombinators] = useState(false);
  const [enableDragAndDrop, setEnableDragAndDrop] = useState(false);
  const [parseNumbers, setParseNumbers] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const commonProps: QueryBuilderProps<DefaultRuleGroupType> = {
    fields,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    resetOnFieldChange,
    resetOnOperatorChange,
    autoSelectField,
    autoSelectOperator,
    addRuleToNewGroups,
    enableDragAndDrop,
    disabled,
    debugMode,
    validator: useValidation ? defaultValidator : undefined,
  };

  return (
    <div>
      {independentCombinators ? (
        <QueryBuilder
          key="rqb-ic"
          {...(commonProps as unknown as QueryBuilderProps<DefaultRuleGroupTypeIC>)}
          independentCombinators
          query={queryIC}
          onQueryChange={q => setQueryIC(q)}
        />
      ) : (
        <QueryBuilder
          key="rqb"
          {...commonProps}
          independentCombinators={false}
          query={query}
          onQueryChange={q => setQuery(q)}
        />
      )}
      <div>
        {(
          [
            [
              showCombinatorsBetweenRules,
              setShowCombinatorsBetweenRules,
              'Show Combinators Between Rules',
            ],
            [showNotToggle, setShowNotToggle, 'Show Not Toggle'],
            [showCloneButtons, setShowCloneButtons, 'Show Clone Buttons'],
            [resetOnFieldChange, setResetOnFieldChange, 'Reset On Field Change'],
            [resetOnOperatorChange, setResetOnOperatorChange, 'Reset On Operator Change'],
            [autoSelectField, setAutoSelectField, 'Auto-Select Field'],
            [autoSelectOperator, setAutoSelectOperator, 'Auto-Select Operator'],
            [addRuleToNewGroups, setAddRuleToNewGroups, 'Add Rule To New Groups'],
            [useValidation, setUseValidation, 'Use Validation'],
            [independentCombinators, setIndependentCombinators, 'Independent Combinators'],
            [enableDragAndDrop, setEnableDragAndDrop, 'Enable Drag-And-Drop'],
            [disabled, setDisabled, 'Disabled'],
            [debugMode, setDebugMode, 'Debug Mode'],
            [parseNumbers, setParseNumbers, 'Parse Numbers'],
          ] as const
        ).map(([value, setter, label]) => (
          <label key={label}>
            <input type="checkbox" checked={value} onChange={e => setter(e.target.checked)} />
            {label}
          </label>
        ))}
      </div>
      <h5>
        JSON (without <code>id</code>s)
      </h5>
      <pre>
        {JSON.stringify(
          JSON.parse(formatQuery(query, { format: 'json_without_ids', parseNumbers })),
          null,
          2
        )}
      </pre>
      <h5>Parameterized SQL</h5>
      <pre>
        {JSON.stringify(formatQuery(query, { format: 'parameterized', parseNumbers }), null, 2)}
      </pre>
      <h5>Parameterized (Named) SQL</h5>
      <pre>
        {JSON.stringify(
          formatQuery(query, { format: 'parameterized_named', parseNumbers }),
          null,
          2
        )}
      </pre>
      <h5>SQL</h5>
      <pre>{formatQuery(query, { format: 'sql', parseNumbers })}</pre>
      <h5>MongoDB</h5>
      <pre>{formatQuery(query, { format: 'mongodb', parseNumbers })}</pre>
      <h5>CEL</h5>
      <pre>{formatQuery(query, { format: 'cel', parseNumbers })}</pre>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
