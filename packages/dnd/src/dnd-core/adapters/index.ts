/**
 * Adapter registry and factory functions
 */

import type { DndAdapter, DndLibrary } from '../types';
import { createReactDndAdapter } from './react-dnd';
import { createHelloPangeaDndAdapter } from './hello-pangea-dnd';
import { createDndKitAdapter } from './dnd-kit';
import { createPragmaticDragAndDropAdapter } from './pragmatic-drag-and-drop';

export * from './base';
export * from './react-dnd';
export * from './hello-pangea-dnd';
export * from './dnd-kit';
export * from './pragmatic-drag-and-drop';

type AdapterFactory = () => DndAdapter;

const adapterRegistry: Record<DndLibrary, AdapterFactory> = {
  'react-dnd': createReactDndAdapter,
  '@hello-pangea/dnd': createHelloPangeaDndAdapter,
  '@dnd-kit/core': createDndKitAdapter,
  '@atlaskit/pragmatic-drag-and-drop': createPragmaticDragAndDropAdapter,
};

/**
 * Creates a DnD adapter for the specified library
 */
export function createAdapter(library: DndLibrary): DndAdapter {
  const factory = adapterRegistry[library];
  
  if (!factory) {
    throw new Error(`Unsupported DnD library: ${library}. Supported libraries: ${Object.keys(adapterRegistry).join(', ')}`);
  }
  
  return factory();
}

/**
 * Gets the list of supported DnD libraries
 */
export function getSupportedLibraries(): DndLibrary[] {
  return Object.keys(adapterRegistry) as DndLibrary[];
}

/**
 * Checks if a DnD library is supported
 */
export function isLibrarySupported(library: string): library is DndLibrary {
  return library in adapterRegistry;
}