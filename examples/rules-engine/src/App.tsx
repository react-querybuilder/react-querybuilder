import type { RulesEngine, RulesEngineExportFormat } from '@react-querybuilder/rules-engine';
import { formatRulesEngine, RulesEngineBuilder } from '@react-querybuilder/rules-engine';
import { Engine } from 'json-rules-engine';
import { useEffect, useMemo, useState } from 'react';
import { ConsequentParamsEditor } from './ConsequentParamsEditor';
import { consequentTypes } from './consequentTypes';
import { initialRulesEngine } from './initialRulesEngine';
import { reFields } from './reFields';
import { sampleMusicians } from './sampleMusicians';
import './styles.css';

interface FiredEvent {
  type: string;
  params?: Record<string, unknown>;
}

interface RunResult {
  musician: string;
  events: FiredEvent[];
}

const components = { consequentBuilderBody: ConsequentParamsEditor };
const queryBuilderProps = { fields: reFields };

const toggleDefaults = {
  allowNestedConditions: true,
  allowDefaultConsequents: true,
  autoSelectConsequentType: true,
};

type ToggleKey = keyof typeof toggleDefaults;

interface ExportOutput {
  format: RulesEngineExportFormat;
  code: string;
}

export const App = () => {
  const [re, setRE] = useState<RulesEngine>(initialRulesEngine);
  const [toggles, setToggles] = useState(toggleDefaults);
  const [results, setResults] = useState<RunResult[]>([]);
  const [runError, setRunError] = useState('');

  // Serializable export outputs (recomputed on every RE change). `rulepilot` throws in cumulative
  // mode (the error is shown in place). `native`/`node-rules` are omitted: their results contain
  // functions and don't have a meaningful serialized representation.
  const exportOutputs = useMemo<ExportOutput[]>(() => {
    const build = (format: RulesEngineExportFormat, render: () => string): ExportOutput => {
      try {
        return { format, code: render() };
      } catch (error) {
        return { format, code: `// Error: ${(error as Error).message}` };
      }
    };
    return [
      build('json-rules-engine', () =>
        JSON.stringify(formatRulesEngine(re, 'json-rules-engine'), null, 2)
      ),
      build('rulepilot', () => JSON.stringify(formatRulesEngine(re, 'rulepilot'), null, 2)),
    ];
  }, [re]);

  // Debounced execution against the sample musicians.
  useEffect(() => {
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
    <div>
      <div>
        {(Object.keys(toggleDefaults) as ToggleKey[]).map(key => (
          <label key={key}>
            <input type="checkbox" checked={toggles[key]} onChange={() => handleToggle(key)} />
            <code>{key}</code>
          </label>
        ))}
      </div>
      <RulesEngineBuilder
        rulesEngine={re}
        onRulesEngineChange={setRE}
        consequentTypes={consequentTypes}
        queryBuilderProps={queryBuilderProps}
        components={components}
        allowNestedConditions={toggles.allowNestedConditions}
        allowDefaultConsequents={toggles.allowDefaultConsequents}
        autoSelectConsequentType={toggles.autoSelectConsequentType}
      />
      <h4>Results (json-rules-engine run against sample musicians)</h4>
      {runError ? (
        <pre>Error: {runError}</pre>
      ) : (
        <table>
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
                    <ul>
                      {events.map(event => (
                        <li key={JSON.stringify(event)}>
                          <strong>{event.type}</strong>{' '}
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
      <h4>RulesEngine JSON</h4>
      <pre>{JSON.stringify(re, null, 2)}</pre>
      {exportOutputs.map(({ format, code }) => (
        <div key={format}>
          <h4>{format}</h4>
          <pre>{code}</pre>
        </div>
      ))}
    </div>
  );
};
