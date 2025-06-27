# React Query Builder Development Guide for Claude

This guide provides comprehensive information for maintaining and developing the React Query Builder project, focusing on consistent code style, development workflow, and project-specific patterns.

## Project Overview

React Query Builder is a monorepo containing:

- **Main package**: `react-querybuilder` - The core query builder component
- **UI integrations**: Packages for Ant Design, Bootstrap, Bulma, Chakra UI, Fluent UI, Mantine, MUI, and Tremor
- **Extensions**: Drag-and-drop (`@react-querybuilder/dnd`), DateTime (`@react-querybuilder/datetime`), React Native (`@react-querybuilder/native`)
- **Documentation**: Docusaurus-based website with examples and API docs

## Development Workflow

### Setup & Installation

```bash
# Uses Bun as package manager
bun install
bun run build
```

### Development Commands

**Primary Development:**

- `bun start` - Hot-reloading dev server for all packages
- `bun start:rqb` - Core package development
- `bun start:antd`, `bun start:material`, etc. - Specific UI integration packages

**Testing & Quality:**

- `bun checkall` - Complete CI check (build, lint, typecheck, test, coverage)
- `bun run test` - Run all tests (Bun tests + Jest)
  - Always include the "run" part of this command to run Jest tests&mdash;`bun test` doesn't run the "test" script in `package.json`
- `bun typecheck` - TypeScript checking across all packages
- `bun lint` - ESLint + Oxlint checking
- `bun pretty-print` - Prettier formatting

**Documentation:**

- `bun web` - Serve documentation website locally
- `bun web:skiptypedoc` - Skip TypeDoc generation for faster startup

### Build Process

- `bun run build` - Concurrent build of all packages
- `bun run build:sequential` - Sequential build for debugging
- Individual package builds: `bun build:rqb`, `bun build:antd`, etc.

## Code Style & Patterns

### File Organization

```
packages/react-querybuilder/src/
├── components/        # React components (PascalCase.tsx)
├── context/           # React contexts
├── hooks/             # Custom hooks (useHookName.ts)
├── types/             # TypeScript definitions
├── utils/             # Utility functions (camelCase.ts)
├── styles/            # SCSS stylesheets
├── redux/             # Redux integration
└── barrel.ts          # Main export aggregator
```

### Naming Conventions

- **Components**: PascalCase (`QueryBuilder.tsx`, `ValueEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (`useFields.ts`, `useRule.ts`)
- **Utilities**: camelCase (`generateID.ts`, `isRuleGroup.ts`)
- **Types**: Descriptive camelCase (`basic.ts`, `validation.ts`)
- **Debug versions**: `*.debug.ts`
- **Tests**: `*.test.ts` or `*.test.tsx`
- **Platform-specific**: `*.web.tsx`, `*.native.tsx`

### TypeScript Patterns

**Advanced Type Usage:**

- Heavy use of generics with constraints
- Conditional types for API flexibility
- Branded types for type safety
- Separation of React-dependent and independent types
  - Easier to use `react-querybuilder` without installing `react`, e.g. on the server.

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

### Component Architecture

**Key Patterns:**

- **Composition over inheritance**: Render props and component injection
- **Memoization**: Extensive use of `React.memo()` for performance
- **Custom hooks**: Logic extraction into reusable hooks
- **Provider pattern**: Context for state management

```typescript
export const ComponentName = React.memo(function ComponentName(props: PropsType) {
  const hookResult = useCustomHook(props);
  const memoizedValue = useMemo(() => computation, [dependencies]);

  return <div className={clsx(baseClassNames.component, customClass)} />;
});
```

### Import/Export Conventions

**Barrel Exports:**

- Use `index.ts` files for aggregating exports
- Main `barrel.ts` for non-React exports
- Clean separation between React and non-React code

```typescript
// React imports
import * as React from 'react';

// Type-only imports
import type { ComponentProps } from '../types';

// Named imports for utilities
import { generateID, isRuleGroup } from '../utils';
```

### Styling Approach

**SCSS + CSS Custom Properties:**

- SCSS preprocessing with modern CSS features
- BEM-like methodology (`.queryBuilder-rule`)
- Customizable design tokens via SCSS variables
- Custom `clsx` utility for conditional classes

### State Management Patterns

- **Immer integration**: Immutable state updates
- **Controlled/uncontrolled**: Flexible prop handling with `useControlledOrUncontrolled`
- **Path-based updates**: Tree navigation using array paths `[0, 1, 2]`
- **Context providers**: Avoid prop drilling for deeply nested components

## Testing Guidelines

### Test Setup

- **Jest + Testing Library**: Standard React testing
- **Custom utilities**: Shared helpers in `utils/testing/`
- **Comprehensive coverage**: 100% coverage requirement
- **Mock patterns**: Extensive Jest mocking

### Test Naming

- Test files: `ComponentName.test.tsx`
- Describe blocks: Component or function name
- Test cases: Descriptive behavior

## Generated Files

**Never edit these files directly:**

- `packages/react-querybuilder/src/utils/parseCEL/celParser.js`
- `packages/react-querybuilder/src/utils/parseSQL/sqlParser.js`
- All example projects except `_template`

**Regeneration commands:**

- `bun generate-parsers` - Regenerate CEL and SQL parsers
- `bun generate-examples` - Regenerate example projects

## Performance Considerations

**Optimization Patterns:**

- Aggressive memoization (`useMemo`, `useCallback`, `React.memo`)
- Lazy loading for parser utilities
- Path-based state updates to avoid unnecessary re-renders
- Context usage to prevent prop drilling

## Accessibility Requirements

- **ARIA attributes**: Proper labeling and descriptions
- **Test IDs**: Consistent `data-testid` attributes
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Accessible descriptions

## Internationalization

- **Translation system**: `Translations` type with comprehensive i18n
- **Flexible formatting**: Support for both JSX and string translations
- **UI framework integration**: Works with different component libraries

## Package-Specific Considerations

### Core Package (`react-querybuilder`)

- Must maintain backward compatibility
- No breaking changes without major version bump
- Export both React and non-React functionality

### UI Integration Packages

- Follow the base package's component structure
- Implement all required control elements
- Maintain consistent theming with UI framework
- Include examples and documentation

### Extension Packages (`dnd`, `datetime`, `native`)

- Extend core functionality without breaking changes
- Provide clear integration instructions
- Maintain feature parity where applicable

## Release Process

1. Update version with `bun version`
2. Run `bun checkall` to ensure quality
3. Build and test all packages
4. Update documentation if needed
5. Create and push release commit
6. Lerna handles package publishing

## Common Pitfalls to Avoid

1. **Breaking changes**: Always maintain backward compatibility in minor versions
2. **Missing memoization**: Components should be memoized for performance
3. **Type imports**: Use `import type` for type-only imports
4. **Direct DOM manipulation**: Use React patterns exclusively
5. **Prop drilling**: Use context for deeply nested props
6. **Generated file edits**: Never edit generated files directly
7. **Missing tests**: Maintain 100% test coverage
8. **Accessibility**: Always include ARIA attributes and keyboard support

## IDE Configuration

**Recommended extensions:**

- ESLint
- Prettier
- TypeScript
- SCSS IntelliSense

**Settings:**

- Format on save with Prettier
- Auto-fix ESLint errors
- TypeScript strict mode
- Show inline type hints

## Quick Reference

**Key Commands:**

- `bun checkall` - Full CI pipeline
- `bun start` - Development server
- `bun run test` - Run tests
- `bun pretty-print` - Format code
- `bun generate-examples` - Update examples

**Key Directories:**

- `packages/react-querybuilder/src/` - Core source
- `examples/` - Demo applications
- `website/` - Documentation site
- `utils/` - Build and dev utilities

This guide should be your primary reference for maintaining consistency and quality in the React Query Builder project.
