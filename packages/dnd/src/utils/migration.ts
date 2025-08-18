/**
 * Migration utilities for transitioning from react-dnd to library-agnostic DnD
 */

import type { DndConfig, DndLibrary } from '../dnd-core/types';
import type { DndProp } from '../types';

/**
 * Create a DnD configuration from library type and options
 */
export function createDndConfig(
  library: DndLibrary,
  options: {
    backend?: any;
    debugMode?: boolean;
    copyModeKey?: string;
    groupModeKey?: string;
  } = {}
): DndConfig {
  return {
    library,
    backend: options.backend,
    debugMode: options.debugMode,
    modifierKeys: {
      copyModeKey: options.copyModeKey || 'alt',
      groupModeKey: options.groupModeKey || 'ctrl',
    },
  };
}

/**
 * Migrate from react-dnd configuration to library-agnostic configuration
 */
export function migrateFromReactDnd(reactDndProp?: DndProp): DndConfig {
  return {
    library: 'react-dnd',
    backend: reactDndProp?.ReactDndBackend,
    debugMode: false, // react-dnd debug mode was set at provider level
    modifierKeys: {
      copyModeKey: 'alt',
      groupModeKey: 'ctrl',
    },
  };
}

/**
 * Get recommended DnD library based on environment and requirements
 */
export function getRecommendedLibrary(requirements: {
  touchSupport?: boolean;
  performance?: 'high' | 'medium' | 'low';
  bundleSize?: 'small' | 'medium' | 'large';
  ecosystem?: 'react' | 'any';
}): DndLibrary {
  const { performance, bundleSize, ecosystem } = requirements;

  // @atlaskit/pragmatic-drag-and-drop for high performance and small bundle
  if (performance === 'high' && bundleSize === 'small') {
    return '@atlaskit/pragmatic-drag-and-drop';
  }

  // @dnd-kit/core for modern React apps with good performance
  if (ecosystem === 'react' && performance !== 'low') {
    return '@dnd-kit/core';
  }

  // @hello-pangea/dnd for simpler use cases
  if (bundleSize === 'medium' && performance === 'medium') {
    return '@hello-pangea/dnd';
  }

  // react-dnd for backwards compatibility and complex use cases
  return 'react-dnd';
}

/**
 * Migration guide suggestions
 */
export function getMigrationGuide(fromLibrary: string, toLibrary: DndLibrary): string[] {
  const guides: string[] = [];

  if (fromLibrary === 'react-dnd') {
    guides.push(
      '1. Update imports: import { QueryBuilderDnD } from "@react-querybuilder/dnd"',
      '2. Replace dnd prop with new config format',
      '3. Test drag and drop functionality'
    );

    switch (toLibrary) {
      case '@dnd-kit/core':
        guides.push(
          '4. Install @dnd-kit/core: npm install @dnd-kit/core',
          '5. Remove react-dnd dependencies if not used elsewhere',
          '6. Update dnd config: { library: "@dnd-kit/core" }'
        );
        break;
      case '@hello-pangea/dnd':
        guides.push(
          '4. Install @hello-pangea/dnd: npm install @hello-pangea/dnd',
          '5. Remove react-dnd dependencies if not used elsewhere',
          '6. Update dnd config: { library: "@hello-pangea/dnd" }'
        );
        break;
      case '@atlaskit/pragmatic-drag-and-drop':
        guides.push(
          '4. Install @atlaskit/pragmatic-drag-and-drop: npm install @atlaskit/pragmatic-drag-and-drop',
          '5. Remove react-dnd dependencies if not used elsewhere',
          '6. Update dnd config: { library: "@atlaskit/pragmatic-drag-and-drop" }'
        );
        break;
    }
  }

  return guides;
}

/**
 * Compatibility checker - warns about potential issues when migrating
 */
export function checkCompatibility(
  fromLibrary: string,
  toLibrary: DndLibrary,
  // oxlint-disable-next-line no-explicit-any
  currentConfig?: any
): { warnings: string[]; blockers: string[] } {
  const warnings: string[] = [];
  const blockers: string[] = [];

  if (fromLibrary === 'react-dnd') {
    if (toLibrary === '@hello-pangea/dnd') {
      warnings.push('Touch device support may differ', 'Custom backends are not supported');
    }

    if (toLibrary === '@dnd-kit/core') {
      warnings.push(
        'Drag preview customization works differently',
        'Drop target highlighting may need adjustment'
      );
    }

    if (toLibrary === '@atlaskit/pragmatic-drag-and-drop') {
      warnings.push('No provider component needed', 'Different event handling system');
    }

    if (currentConfig?.debugMode) {
      warnings.push('Debug mode implementation may differ between libraries');
    }
  }

  return { warnings, blockers };
}
