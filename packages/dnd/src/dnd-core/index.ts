/**
 * DnD Core - Library-agnostic drag and drop abstraction layer
 */

export * from './types';
export * from './adapters';

import type { DndAdapter, DndConfig, DndLibrary } from './types';
import { createAdapter, isLibrarySupported } from './adapters';

/**
 * DnD Manager - Central class for managing drag and drop functionality
 */
export class DndManager {
  private adapter: DndAdapter | null = null;
  private config: DndConfig | null = null;

  /**
   * Initialize the DnD manager with a specific library and configuration
   */
  async initialize(config: DndConfig): Promise<void> {
    if (!isLibrarySupported(config.library)) {
      throw new Error(`Unsupported DnD library: ${config.library}`);
    }

    this.config = config;
    
    if (config.adapter) {
      this.adapter = config.adapter;
    } else {
      this.adapter = createAdapter(config.library);
    }

    // Ensure the adapter is loaded (for dynamic imports)
    if ('ensureLoaded' in this.adapter && typeof this.adapter.ensureLoaded === 'function') {
      await this.adapter.ensureLoaded();
    }
  }

  /**
   * Get the current adapter
   */
  getAdapter(): DndAdapter {
    if (!this.adapter) {
      throw new Error('DnD manager not initialized. Call initialize() first.');
    }
    return this.adapter;
  }

  /**
   * Get the current configuration
   */
  getConfig(): DndConfig {
    if (!this.config) {
      throw new Error('DnD manager not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Check if the manager is initialized
   */
  isInitialized(): boolean {
    return this.adapter !== null && this.config !== null;
  }

  /**
   * Get the library being used
   */
  getLibrary(): DndLibrary | null {
    return this.config?.library ?? null;
  }
}

/**
 * Default DnD manager instance
 */
export const dndManager = new DndManager();