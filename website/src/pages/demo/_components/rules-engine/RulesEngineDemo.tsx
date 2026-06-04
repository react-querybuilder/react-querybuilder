import type { RulesEngine } from '@react-querybuilder/rules-engine';
import {
  formatRulesEngine,
  jsonRulesEngineAdditionalOperators,
  RulesEngineBuilder,
} from '@react-querybuilder/rules-engine';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import { Engine } from 'json-rules-engine';
import * as React from 'react';
import { consequentTypes } from './_constants/consequentTypes';
import { initialRulesEngine } from './_constants/initialRulesEngine';
import { reFields } from './_constants/reFields';
import { sampleMusicians } from './_constants/sampleMusicians';
import { ConsequentParamsEditor } from './ConsequentParamsEditor';
import styles from './RulesEngineDemo.module.css';

interface FiredEvent {
  type: string;
  params?: Record<string, unknown>;
}

interface RunResult {
  musician: string;
  events: FiredEvent[];
}

const components = { consequentBuilderBody: ConsequentParamsEditor };

const toggleDefaults = {
  allowNestedConditions: true,
  allowDefaultConsequents: true,
  autoSelectConsequentType: true,
};

type ToggleKey = keyof typeof toggleDefaults;

const toggleLabels: Record<ToggleKey, string> = {
  allowNestedConditions: 'allowNestedConditions',
  allowDefaultConsequents: 'allowDefaultConsequents',
  autoSelectConsequentType: 'autoSelectConsequentType',
};

export default function RulesEngineDemo(): React.JSX.Element {
  const [re, setRE] = React.useState<RulesEngine>(initialRulesEngine);
  const [toggles, setToggles] = React.useState(toggleDefaults);
  const [results, setResults] = React.useState<RunResult[]>([]);
  const [runError, setRunError] = React.useState<string>('');

  // json-rules-engine export (recomputed on every RE change).
  const jsonRulesEngine = React.useMemo(() => {
    try {
      return JSON.stringify(formatRulesEngine(re, 'json-rules-engine'), null, 2);
    } catch (error) {
      return `// Error: ${(error as Error).message}`;
    }
  }, [re]);

  // Debounced execution against the sample musicians.
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const rules = formatRulesEngine(re, 'json-rules-engine');
        const engine = new Engine(rules, { allowUndefinedFacts: true });
        for (const [operator, evaluator] of Object.entries(jsonRulesEngineAdditionalOperators)) {
          engine.addOperator(operator, evaluator);
        }
        const runResults = await Promise.all(
          sampleMusicians.map(async (musician): Promise<RunResult> => {
            const { events } = await engine.run(musician);
            return {
              musician: [musician.firstName, musician.middleName, musician.lastName]
                .filter(Boolean)
                .join(' '),
              events: events.map(e => ({ type: e.type, params: e.params })),
            };
          })
        );
        setResults(runResults);
        setRunError('');
      } catch (error) {
        setRunError((error as Error).message);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [re]);

  const handleToggle = (key: ToggleKey) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className={styles.demoLayout}>
      <div className={styles.controls}>
        {(Object.keys(toggleLabels) as ToggleKey[]).map(key => (
          <label key={key} className={styles.toggle}>
            <input type="checkbox" checked={toggles[key]} onChange={() => handleToggle(key)} />
            <code>{toggleLabels[key]}</code>
          </label>
        ))}
      </div>
      <div className={styles.mainContent}>
        <div className={styles.builder}>
          <RulesEngineBuilder
            rulesEngine={re}
            onRulesEngineChange={setRE}
            consequentTypes={consequentTypes}
            queryBuilderProps={{ fields: reFields }}
            components={components}
            allowNestedConditions={toggles.allowNestedConditions}
            allowDefaultConsequents={toggles.allowDefaultConsequents}
            autoSelectConsequentType={toggles.autoSelectConsequentType}
          />
        </div>

        <Tabs queryString="reOutput">
          <TabItem value="results" label="Results">
            {runError ? (
              <div className={styles.error}>Error: {runError}</div>
            ) : (
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Musician</th>
                    <th>Fired actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ musician, events }) => (
                    <tr key={musician}>
                      <td>{musician}</td>
                      <td>
                        {events.length === 0 ? (
                          <em>(none)</em>
                        ) : (
                          <ul className={styles.eventList}>
                            {events.map(event => (
                              <li key={JSON.stringify(event)}>
                                <strong>{event.type}</strong>
                                {event.params && Object.keys(event.params).length > 0 && (
                                  <code>{JSON.stringify(event.params)}</code>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TabItem>
          <TabItem value="json-rules-engine" label="json-rules-engine">
            <CodeBlock language="json">{jsonRulesEngine}</CodeBlock>
          </TabItem>
          <TabItem value="rules-engine" label="RulesEngine JSON">
            <CodeBlock language="json">{JSON.stringify(re, null, 2)}</CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
}
