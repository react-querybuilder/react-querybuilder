# DnD Library Migration Guide

This guide explains how to migrate from the react-dnd-specific implementation to the new library-agnostic drag-and-drop system.

## Overview

The `@react-querybuilder/dnd` package has been refactored to support multiple drag-and-drop libraries while maintaining backwards compatibility with react-dnd. You can now use:

- **react-dnd** (existing, backwards compatible)
- **@dnd-kit/core** (modern, performant)
- **@hello-pangea/dnd** (simple, lightweight)
- **@atlaskit/pragmatic-drag-and-drop** (high performance, small bundle)

## Backwards Compatibility

**Existing code continues to work without changes.** The legacy API is fully supported:

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';

// This still works exactly as before
<QueryBuilderDnD>
  <QueryBuilder {...props} />
</QueryBuilderDnD>;
```

## New Library-Agnostic API

### Basic Usage

```tsx
import { QueryBuilderDnD, createDndConfig } from '@react-querybuilder/dnd';

// Configure your preferred DnD library
const dndConfig = createDndConfig('react-dnd');
// OR
const dndConfig = createDndConfig('@dnd-kit/core');
// OR
const dndConfig = createDndConfig('@hello-pangea/dnd');
// OR
const dndConfig = createDndConfig('@atlaskit/pragmatic-drag-and-drop');

<QueryBuilderDnD dnd={dndConfig}>
  <QueryBuilder {...props} />
</QueryBuilderDnD>;
```

### Migration Steps

#### Step 1: Install Your Preferred DnD Library

```bash
# For @dnd-kit/core
npm install @dnd-kit/core

# For @hello-pangea/dnd
npm install @hello-pangea/dnd

# For @atlaskit/pragmatic-drag-and-drop
npm install @atlaskit/pragmatic-drag-and-drop

# react-dnd is already supported (no additional install needed if migrating)
```

#### Step 2: Update Your Code

```tsx
// BEFORE (legacy, still works)
import { QueryBuilderDnD } from '@react-querybuilder/dnd';

<QueryBuilderDnD dnd={myReactDndConfig} copyModeModifierKey="alt" groupModeModifierKey="ctrl">
  <QueryBuilder {...props} />
</QueryBuilderDnD>;

// AFTER (new API)
import { QueryBuilderDnD, createDndConfig } from '@react-querybuilder/dnd';

const dndConfig = createDndConfig('@dnd-kit/core', {
  copyModeKey: 'alt',
  groupModeKey: 'ctrl',
});

<QueryBuilderDnD dnd={dndConfig}>
  <QueryBuilder {...props} />
</QueryBuilderDnD>;
```

#### Step 3: Remove Unused Dependencies (Optional)

If you're migrating away from react-dnd:

```bash
npm uninstall react-dnd react-dnd-html5-backend react-dnd-touch-backend
```

## Library Comparison

| Library                           | Bundle Size | Performance  | Touch Support | Complexity |
| --------------------------------- | ----------- | ------------ | ------------- | ---------- |
| react-dnd                         | 🔴 Large    | 🟢 Good      | 🟢 Good       | 🔴 High    |
| @dnd-kit/core                     | 🟡 Medium   | 🟢 Excellent | 🟢 Excellent  | 🟡 Medium  |
| @hello-pangea/dnd                 | 🟢 Small    | 🟢 Good      | 🟡 Limited    | 🟢 Low     |
| @atlaskit/pragmatic-drag-and-drop | 🟢 Smallest | 🟢 Excellent | 🟢 Good       | 🟢 Low     |

## Advanced Configuration

### Custom Backends (react-dnd only)

```tsx
import { HTML5Backend } from 'react-dnd-html5-backend';

const dndConfig = createDndConfig('react-dnd', {
  backend: HTML5Backend,
  debugMode: true,
});
```

### Library-Specific Options

```tsx
// @dnd-kit/core with custom configuration
const dndConfig = {
  library: '@dnd-kit/core' as const,
  modifierKeys: {
    copyModeKey: 'shift',
    groupModeKey: 'ctrl',
  },
};
```

### Dynamic Library Selection

```tsx
import { getRecommendedLibrary, createDndConfig } from '@react-querybuilder/dnd';

const optimalLibrary = getRecommendedLibrary({
  touchSupport: true,
  performance: 'high',
  bundleSize: 'small',
});

const dndConfig = createDndConfig(optimalLibrary);
```

## Migration Helpers

### Automatic Migration from react-dnd

```tsx
import { migrateFromReactDnd } from '@react-querybuilder/dnd';

// Migrate existing react-dnd configuration
const legacyConfig = {
  /* your existing dnd prop */
};
const newConfig = migrateFromReactDnd(legacyConfig);
```

### Compatibility Checker

```tsx
import { checkCompatibility } from '@react-querybuilder/dnd';

const { warnings, blockers } = checkCompatibility('react-dnd', '@dnd-kit/core', currentConfig);

warnings.forEach(warning => console.warn(warning));
blockers.forEach(blocker => console.error(blocker));
```

## Troubleshooting

### Common Issues

1. **Library not found**: Make sure you've installed the DnD library you're trying to use
2. **TypeScript errors**: Update your imports to use the new types
3. **Drag not working**: Verify the library is properly initialized

### Debug Mode

Enable debug mode to troubleshoot issues:

```tsx
const dndConfig = createDndConfig('react-dnd', {
  debugMode: true,
});
```

### Library-Specific Issues

#### @dnd-kit/core

- Requires React 18+
- May need additional setup for custom drag overlays

#### @hello-pangea/dnd

- Limited touch device support
- Different event handling model

#### @atlaskit/pragmatic-drag-and-drop

- No provider component needed
- Different accessibility features

## Performance Considerations

- **@atlaskit/pragmatic-drag-and-drop**: Best for performance-critical applications
- **@dnd-kit/core**: Good balance of features and performance
- **@hello-pangea/dnd**: Best for simple use cases
- **react-dnd**: Use for complex custom drag-and-drop requirements

## Future Roadmap

- Additional library support (sortable.js, etc.)
- Enhanced touch device optimization
- Advanced customization options
- Performance monitoring tools

## Support

If you encounter issues during migration:

1. Check the [compatibility matrix](#library-comparison)
2. Review [common issues](#common-issues)
3. Use the [migration helpers](#migration-helpers)
4. File an issue on GitHub with your specific use case
