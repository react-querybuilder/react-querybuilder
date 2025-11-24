# React Query Builder Development Guide

**COMMUNICATION STYLE**: Be aggressively concise. Prioritize brevity over grammar. Examples:

- "Build failed" not "The build has failed"
- "Fixed type error" not "I have fixed the type error"
- "Run tests" not "I will run the tests for you"

This guide covers React Query Builder development: code style, workflow, and other patterns.

## Project Overview

React Query Builder monorepo contains:

- **Core package**: `@react-querybuilder/core` - Non-React utilities, parsers, formatters
- **Main package**: `react-querybuilder` - React components and hooks
- **UI integrations**: Ant Design, Bootstrap, Bulma, Chakra UI, Fluent UI, Mantine, MUI, Tremor
- **Extensions**: Drag-and-drop (`@react-querybuilder/dnd`), date/time processing (`@react-querybuilder/datetime`), React Native (`@react-querybuilder/native`)
- **Documentation**: Docusaurus website

## Development Workflow

### Setup

```bash
bun install
bun run build
```

### Commands

**Development:**

- `bun start` - Hot-reload dev server (all packages, Bun server)
- `bun start:rqb` - Main package dev (Vite server)
- `bun start:antd`, `bun start:material`, etc. - UI packages (Vite server)

**Quality:**

- `bun test ...` when React and DOM not involved (much faster than `bunx jest ...`)
- `bunx jest ...` for packages using Jest (excludes core package)
- `bun run --filter @react-querybuilder/core test` for core package (uses Vitest)
- Do not run `bun run test`—it automatically runs unnecessary steps
- `bun typecheck` - TypeScript check
- `bun lint` - Type-aware linting with Oxlint and `tsgo`
- `bun pretty-print` - Format (run after changes)
- `bun checkall` - Full CI check (run before submitting a PR)

**Documentation:**

- `bun web` - Serve documentation website locally
- `bun web:skiptypedoc` - Skip TypeDoc generation for faster startup

### Build

- `bun run build` - All packages (concurrent via Bun CLI filter)
- `bun run build:concurrent` - All packages (concurrent via `concurrently`)
- `bun run build:sequential` - Sequential (better for debugging)
- Individual packages: `bun build:rqb`, `bun build:antd`, etc.

## Code Style

### Structure

```
packages/core/src/           # Non-React utilities
packages/react-querybuilder/src/
├── components/        # React components (PascalCase.tsx)
├── hooks/             # Hooks (useHookName.ts)
├── types/             # TypeScript defs
├── utils/             # Utilities (camelCase.ts)
├── styles/            # SCSS
├── redux/             # Redux
└── barrel.ts          # Export aggregator
```

### Naming

- **Components**: PascalCase (`QueryBuilder.tsx`)
- **Hooks**: camelCase with `use` (`useHookName.ts`)
- **Utilities**: camelCase (`generateID.ts`)
- **Types**: camelCase (`basic.ts`)
- **Debug versions**: `*.debug.ts`
- **Tests**: `*.test.ts[x]`

### TypeScript

- Heavy use of generics with constraints
- Conditional types for API flexibility
- Branded types
- React/non-React type separation (core package enables server usage)

```typescript
// Generic component with constraints
export interface QueryBuilderProps<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> {
  // Component props
}

// Type-only imports
import type { RuleGroupType } from '../types';
```

### Components

- Composition over inheritance
- Heavy memoization (`React.memo()`)
- Custom hooks for logic
- Context for state

```typescript
export const ComponentName = React.memo(function ComponentName(props: PropsType) {
  const hookResult = useCustomHook(props);
  const memoizedValue = useMemo(() => computation, [dependencies]);

  return <div className={clsx(baseClassNames.component, customClass)} />;
});
```

### Imports/Exports

- Use `index.ts` for aggregation
- `barrel.ts` for exports that don't have a "debug" version
- React/non-React separation

```typescript
import * as React from 'react';
import type { ComponentProps } from '../types';
import { generateID, isRuleGroup } from '../utils';
```

### Styling

- SCSS + CSS custom properties
- BEM-like (`.queryBuilder-rule`)
- SCSS variables for tokens
- Custom `clsx` utility for conditional classes

### State Management

- Immer for immutable updates
- Path-based updates `[0, 1, 2]`
- Custom Redux context to avoid prop drilling

## Testing

- Jest + Testing Library (most packages)
- Vitest for @react-querybuilder/core package
- Helpers in `utils/testing/`
- 100% coverage required for Jest packages - use `bunx jest` to test for coverage (not `bun test` or `bun run test`)
- Vitest coverage for core package - use `bun run --filter @react-querybuilder/core test:coverage`

- Test files: `ComponentName.test.tsx`
- Describe blocks: component/function name
- Test cases: Descriptive behavior

## Generated Files

**Never edit:**

- `packages/core/src/utils/parseCEL/celParser.js`
- `packages/core/src/utils/parseSQL/sqlParser.js`
- Examples (except `_template`)

**Regeneration commands:**

- `bun generate-parsers` - Regenerate CEL and SQL parsers
- `bun generate-examples` - Regenerate example projects

## Performance

- Aggressive memoization
- Lazy loading parsers
- Path-based updates
- Context prevents prop drilling

## Accessibility

- ARIA attributes
- `data-testid` attributes
- Keyboard navigation
- Screen reader support

## Internationalization (i18n)

- `Translations` type
- JSX/string translations
- UI framework integration

## Packages

### Core (`@react-querybuilder/core`)

- Non-React utilities, parsers, formatters
- No React dependencies

### Main (`react-querybuilder`)

- React components/hooks
- Backward compatibility required
- No breaking changes without major version bump

### UI Packages

- Follow base package's component structure
- Implement all required control elements
- Maintain consistent theming with UI framework
- Include examples and documentation

### Extensions (`dnd`, `datetime`, `native`)

- Extend core functionality without breaking changes
- Provide clear integration instructions
- Maintain feature parity where applicable

## Release process

1. `bun version`
2. `bun checkall`
3. Update documentation
4. Push release commit
5. Lerna handles package publishing

## Pitfalls

1. Breaking changes in minor versions
2. Missing memoization
3. Missing `import type`
4. Direct DOM manipulation
5. Prop drilling
6. Manually editing generated files
7. Missing tests
8. Missing accessibility

## IDE

**Extensions:** Oxc, Prettier, TypeScript, SCSS IntelliSense
**Settings:** Format on save, TypeScript strict mode, inline type hints

## Quick Reference

**Commands:**

- `bun checkall` - Full CI
- `bun start` - Dev server
- `bun run test` - Tests
- `bun pretty-print` - Format
- `bun generate-examples` - Update examples

**Directories:**

- `packages/core/src/` - Non-React utilities
- `packages/react-querybuilder/src/` - React components
- `examples/` - Demos and starter templates
- `website/` - Documentation site
- `utils/` - Build and dev utilities
