/**
 * Tests to ensure backwards compatibility with existing react-dnd API
 */

import React from 'react';
import { render } from '@testing-library/react';
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderDnD } from '../QueryBuilderDnD';
import { QueryBuilderDnD as QueryBuilderDnDNew } from '../QueryBuilderDnDNew';
import { createDndConfig, migrateFromReactDnd } from '../utils/migration';

// Mock the DnD libraries to avoid actual imports in tests
jest.mock('react-dnd', () => ({
  DndProvider: ({ children }: React.PropsWithChildren) => (
    <div data-testid="dnd-provider">{children}</div>
  ),
  useDrag: () => [{ isDragging: false }, () => {}, () => {}],
  useDrop: () => [{ isOver: false }, () => {}],
}));

jest.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: 'HTML5Backend',
}));

const basicProps = {
  fields: [{ name: 'test', label: 'Test' }],
  query: { combinator: 'and' as const, rules: [] },
  onQueryChange: jest.fn(),
};

describe('Backwards Compatibility', () => {
  it('should render legacy QueryBuilderDnD without errors', () => {
    const { container } = render(
      <QueryBuilderDnD>
        <QueryBuilder {...basicProps} />
      </QueryBuilderDnD>
    );

    expect(container).toBeInTheDocument();
  });

  it('should render new QueryBuilderDnD with react-dnd config', () => {
    const dndConfig = createDndConfig('react-dnd');

    const { container } = render(
      <QueryBuilderDnDNew dnd={dndConfig}>
        <QueryBuilder {...basicProps} />
      </QueryBuilderDnDNew>
    );

    expect(container).toBeInTheDocument();
  });

  it('should migrate legacy dnd prop to new format', () => {
    const legacyDndProp = {
      ReactDndBackend: 'HTML5Backend',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migratedConfig = migrateFromReactDnd(legacyDndProp as any);

    expect(migratedConfig).toEqual({
      library: 'react-dnd',
      backend: 'HTML5Backend',
      debugMode: false,
      modifierKeys: {
        copyModeKey: 'alt',
        groupModeKey: 'ctrl',
      },
    });
  });

  it('should create valid config for all supported libraries', () => {
    const libraries = [
      'react-dnd',
      '@dnd-kit/core',
      '@hello-pangea/dnd',
      '@atlaskit/pragmatic-drag-and-drop',
    ] as const;

    for (const library of libraries) {
      const config = createDndConfig(library);
      expect(config.library).toBe(library);
      expect(config.modifierKeys).toEqual({
        copyModeKey: 'alt',
        groupModeKey: 'ctrl',
      });
    }
  });

  it('should handle disabled drag and drop', () => {
    const { container } = render(
      <QueryBuilderDnD enableDragAndDrop={false}>
        <QueryBuilder {...basicProps} />
      </QueryBuilderDnD>
    );

    expect(container).toBeInTheDocument();
  });

  it('should handle missing dnd configuration gracefully', () => {
    const { container } = render(
      <QueryBuilderDnDNew enableDragAndDrop={false}>
        <QueryBuilder {...basicProps} />
      </QueryBuilderDnDNew>
    );

    expect(container).toBeInTheDocument();
  });
});

describe('Configuration Validation', () => {
  it('should validate supported libraries', () => {
    expect(() => createDndConfig('react-dnd')).not.toThrow();
    expect(() => createDndConfig('@dnd-kit/core')).not.toThrow();
    expect(() => createDndConfig('@hello-pangea/dnd')).not.toThrow();
    expect(() => createDndConfig('@atlaskit/pragmatic-drag-and-drop')).not.toThrow();
  });

  it('should handle custom options', () => {
    const config = createDndConfig('react-dnd', {
      debugMode: true,
      copyModeKey: 'shift',
      groupModeKey: 'meta',
    });

    expect(config).toEqual({
      library: 'react-dnd',
      debugMode: true,
      modifierKeys: {
        copyModeKey: 'shift',
        groupModeKey: 'meta',
      },
    });
  });
});
