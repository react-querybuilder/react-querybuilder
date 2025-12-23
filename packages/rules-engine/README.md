# @react-querybuilder/rules-engine

Rules engine extension for `react-querybuilder`.

> [!CAUTION]
>
> This package is in a very early stage of development.

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

Current support includes [`json-rules-engine`](https://github.com/CacheControl/json-rules-engine).

```ts
import { formatRulesEngine } from '@react-querybuilder/rules-engine';

formatRulesEngine(rulesEngine, { format: 'json-rules-engine' });
```

## Documentation

Full documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org/).
