import type { RulesEngine, RulesEngineExportFormat } from '@react-querybuilder/rules-engine';
import { formatRulesEngine, RulesEngineBuilder } from '@react-querybuilder/rules-engine';
import CodeBlock from '@theme/CodeBlock';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import { Engine } from 'json-rules-engine';
import * as React from 'react';
import { consequentTypes } from './_constants/consequentTypes';
import { initialRulesEngine } from './_constants/initialRulesEngine';
import { reFields } from './_constants/reFields';
import { sampleMusicians } from './_constants/sampleMusicians';
import styles from './RulesEngineDemo.module.css';

interface FiredEvent {
  type: string;
  params?: Record<string, unknown>;
}

interface RunResult {
  musician: string;
  events: FiredEvent[];
}

const toggleDefaults = {
  addConsequentToNewConditions: false,
  allowNestedConditions: true,
  allowDefaultConsequents: true,
  autoSelectConsequentType: true,
  showShiftActions: false,
};

type ToggleKey = keyof typeof toggleDefaults;

const toggleLabels: Record<ToggleKey, string> = {
  addConsequentToNewConditions: 'addConsequentToNewConditions',
  allowNestedConditions: 'allowNestedConditions',
  allowDefaultConsequents: 'allowDefaultConsequents',
  autoSelectConsequentType: 'autoSelectConsequentType',
  showShiftActions: 'showShiftActions',
};

interface ExportTab {
  format: RulesEngineExportFormat;
  language: 'json' | 'js';
  code: string;
}

export default function RulesEngineDemo(): React.JSX.Element {
  const [re, setRE] = React.useState<RulesEngine>(initialRulesEngine);
  const [toggles, setToggles] = React.useState(toggleDefaults);
  const [results, setResults] = React.useState<RunResult[]>([]);
  const [runError, setRunError] = React.useState<string>('');

  // Serializable export outputs (recomputed on every RE change). `rulepilot` throws in cumulative
  // mode (the error is shown in place). `native`/`node-rules` are omitted: their results contain
  // functions and don't have a meaningful serialized representation.
  const exportTabs = React.useMemo<ExportTab[]>(() => {
    const build = (
      format: RulesEngineExportFormat,
      render: () => Omit<ExportTab, 'format'>
    ): ExportTab => {
      try {
        return { format, ...render() };
      } catch (error) {
        return { format, language: 'js', code: `// Error: ${(error as Error).message}` };
      }
    };
    return [
      build('json-rules-engine', () => ({
        language: 'json',
        code: JSON.stringify(formatRulesEngine(re, 'json-rules-engine'), null, 2),
      })),
      build('rulepilot', () => ({
        language: 'json',
        code: JSON.stringify(formatRulesEngine(re, 'rulepilot'), null, 2),
      })),
    ];
  }, [re]);

  // Debounced execution against the sample musicians.
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const engine = new Engine([], { allowUndefinedFacts: true });
        // Passing `context: { engine }` registers the additional operators (beginsWith, between, etc.).
        const rules = formatRulesEngine(re, { format: 'json-rules-engine', context: { engine } });
        for (const rule of rules) {
          engine.addRule(rule);
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
            addConsequentToNewConditions={toggles.addConsequentToNewConditions}
            allowNestedConditions={toggles.allowNestedConditions}
            allowDefaultConsequents={toggles.allowDefaultConsequents}
            autoSelectConsequentType={toggles.autoSelectConsequentType}
            showShiftActions={toggles.showShiftActions}
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
          <TabItem value="rules-engine" label="RulesEngine JSON">
            <CodeBlock language="json">{JSON.stringify(re, null, 2)}</CodeBlock>
          </TabItem>
          {exportTabs.map(({ format, language, code }) => (
            <TabItem key={format} value={format} label={format}>
              <CodeBlock language={language}>{code}</CodeBlock>
            </TabItem>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
