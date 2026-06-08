# @react-querybuilder/rules-engine

Rules engine extension for `react-querybuilder`.

> [!CAUTION]
>
> This package is in a very early stage of development.

## Documentation

Full documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org/).

## Installation

```bash
npm install react-querybuilder @react-querybuilder/rules-engine
# OR yarn add / pnpm add / bun add
```

## Usage

```tsx
import { RulesEngineBuilder } from '@react-querybuilder/rules-engine';

function App() {
  return <RulesEngineBuilder />;
}
```

### Export

Convert a `RulesEngine`/`RulesEngineIC` to an external rule engine format with `formatRulesEngine`. Supported formats:

| Format                | Output                                                  | Library             |
| --------------------- | ------------------------------------------------------- | ------------------- |
| `"native"`            | in-process evaluator function `(facts) => Consequent[]` | _(none)_            |
| `"json-rules-engine"` | array of rules to add to an `Engine`                    | [json-rules-engine] |
| `"node-rules"`        | array of `Rule` objects for `new RuleEngine(...)`       | [node-rules]        |
| `"rulepilot"`         | single `Rule` (first-matched result)                    | [rulepilot]         |

```ts
import { formatRulesEngine } from '@react-querybuilder/rules-engine';

// "native" — zero-dependency in-process evaluator; returns fired consequents in order
const evaluate = formatRulesEngine(rulesEngine, { format: 'native' });
const firedConsequents = evaluate({ experience: 12 });

// "json-rules-engine" — add each rule to an Engine (pass `context: { engine }` to
// auto-register the supplemental operators)
const engine = new Engine();
for (const rule of formatRulesEngine(rulesEngine, {
  format: 'json-rules-engine',
  context: { engine },
})) {
  engine.addRule(rule);
}

// "node-rules" — pass the rules straight to a RuleEngine
const R = new RuleEngine(formatRulesEngine(rulesEngine, { format: 'node-rules' }));
R.execute({ experience: 12 }, ({ events }) => console.log(events));

// "rulepilot" — single (first-matched) result; pass `true` to skip pre-validation
const rule = formatRulesEngine(rulesEngine, { format: 'rulepilot' });
const result = await RulePilot.evaluate(rule, { experience: 12 }, true);
```

> [!NOTE]
>
> The `"rulepilot"` target models single-outcome decisioning: `RulePilot.evaluate` returns only the first matching condition's result, so a rules engine whose nested or overlapping conditions fire multiple consequents under the other targets yields just the first match. Cumulative evaluation mode has no rulepilot representation and throws. RQB's substring operators (`contains`, `beginsWith`, `endsWith`, and their negations) have no faithful rulepilot mapping and are omitted.

[json-rules-engine]: https://github.com/CacheControl/json-rules-engine
[node-rules]: https://github.com/mithunsatheesh/node-rules
[rulepilot]: https://github.com/andrewbrg/rulepilot
