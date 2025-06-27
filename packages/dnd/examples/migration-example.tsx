/**
 * Migration examples showing how to transition from react-dnd to library-agnostic DnD
 */

import React from 'react';
import { QueryBuilder } from 'react-querybuilder';
import { 
  QueryBuilderDnD as LegacyQueryBuilderDnD,
  QueryBuilderDnDNew,
  createDndConfig,
  migrateFromReactDnd,
} from '@react-querybuilder/dnd';

// Example 1: Legacy react-dnd usage (backwards compatible)
export const LegacyExample = () => {
  return (
    <LegacyQueryBuilderDnD>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </LegacyQueryBuilderDnD>
  );
};

// Example 2: New library-agnostic API with react-dnd
export const ReactDndExample = () => {
  const dndConfig = createDndConfig('react-dnd', {
    debugMode: false,
    copyModeKey: 'alt',
    groupModeKey: 'ctrl',
  });

  return (
    <QueryBuilderDnDNew dnd={dndConfig}>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </QueryBuilderDnDNew>
  );
};

// Example 3: Using @dnd-kit/core
export const DndKitExample = () => {
  const dndConfig = createDndConfig('@dnd-kit/core', {
    debugMode: false,
  });

  return (
    <QueryBuilderDnDNew dnd={dndConfig}>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </QueryBuilderDnDNew>
  );
};

// Example 4: Using @hello-pangea/dnd
export const HelloPangeaExample = () => {
  const dndConfig = createDndConfig('@hello-pangea/dnd');

  return (
    <QueryBuilderDnDNew dnd={dndConfig}>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </QueryBuilderDnDNew>
  );
};

// Example 5: Using @atlaskit/pragmatic-drag-and-drop
export const PragmaticDragAndDropExample = () => {
  const dndConfig = createDndConfig('@atlaskit/pragmatic-drag-and-drop');

  return (
    <QueryBuilderDnDNew dnd={dndConfig}>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </QueryBuilderDnDNew>
  );
};

// Example 6: Migration from legacy to new API
export const MigrationExample = () => {
  // Step 1: Get your existing react-dnd configuration
  const legacyDndProp = undefined; // Your existing dnd prop

  // Step 2: Migrate to new format
  const migratedConfig = migrateFromReactDnd(legacyDndProp);

  // Step 3: Use new API
  return (
    <QueryBuilderDnDNew dnd={migratedConfig}>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </QueryBuilderDnDNew>
  );
};

// Example 7: Dynamic library selection based on environment
export const DynamicLibraryExample = () => {
  const getOptimalConfig = () => {
    // Choose library based on requirements
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      // Touch device - use library with good touch support
      return createDndConfig('@dnd-kit/core');
    } else {
      // Desktop - prioritize performance
      return createDndConfig('@atlaskit/pragmatic-drag-and-drop');
    }
  };

  const dndConfig = getOptimalConfig();

  return (
    <QueryBuilderDnDNew dnd={dndConfig}>
      <QueryBuilder 
        fields={[]}
        query={{ combinator: 'and', rules: [] }}
        onQueryChange={() => {}}
      />
    </QueryBuilderDnDNew>
  );
};