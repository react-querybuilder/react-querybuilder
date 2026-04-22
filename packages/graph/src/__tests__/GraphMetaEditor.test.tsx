import type { RuleType } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @vitest-environment jsdom
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GraphMetaEditor } from '../GraphMetaEditor';

const baseRule: RuleType = { field: 'name', operator: '=', value: 'Alice' };

describe('GraphMetaEditor', () => {
  describe('Cypher/GQL mode', () => {
    it('should render Cypher fields', () => {
      const handleOnChange = vi.fn();
      render(
        <GraphMetaEditor
          rule={{
            ...baseRule,
            meta: { graphRole: 'pattern', nodeAlias: 'a', nodeLabel: 'Person' },
          }}
          handleOnChange={handleOnChange}
          graphLang="cypher"
        />
      );
      expect(screen.getByTestId('graph-meta-editor')).toBeDefined();
      expect(screen.getByDisplayValue('a')).toBeDefined();
      expect(screen.getByDisplayValue('Person')).toBeDefined();
    });

    it('should call handleOnChange when nodeAlias changes', async () => {
      const user = userEvent.setup();
      const handleOnChange = vi.fn();
      render(
        <GraphMetaEditor
          rule={{ ...baseRule, meta: { graphRole: 'pattern', nodeAlias: '', nodeLabel: '' } }}
          handleOnChange={handleOnChange}
          graphLang="cypher"
        />
      );
      const aliasInput = screen.getByPlaceholderText('a');
      await user.type(aliasInput, 'x');
      expect(handleOnChange).toHaveBeenCalled();
      const lastCall = handleOnChange.mock.calls[handleOnChange.mock.calls.length - 1][0];
      expect(lastCall.nodeAlias).toBe('x');
    });
  });

  describe('SPARQL mode', () => {
    it('should render SPARQL fields', () => {
      const handleOnChange = vi.fn();
      render(
        <GraphMetaEditor
          rule={{ ...baseRule, meta: { graphRole: 'pattern', subject: '?person' } }}
          handleOnChange={handleOnChange}
          graphLang="sparql"
        />
      );
      expect(screen.getByDisplayValue('?person')).toBeDefined();
    });
  });

  describe('Gremlin mode', () => {
    it('should render Gremlin fields', () => {
      const handleOnChange = vi.fn();
      render(
        <GraphMetaEditor
          rule={{ ...baseRule, meta: { graphRole: 'pattern', stepLabel: 'a', edgeLabel: 'knows' } }}
          handleOnChange={handleOnChange}
          graphLang="gremlin"
        />
      );
      expect(screen.getByDisplayValue('a')).toBeDefined();
      expect(screen.getByDisplayValue('knows')).toBeDefined();
    });
  });

  it('should respect disabled prop', () => {
    const handleOnChange = vi.fn();
    render(
      <GraphMetaEditor
        rule={baseRule}
        handleOnChange={handleOnChange}
        graphLang="cypher"
        disabled
      />
    );
    const inputs = screen.getByTestId('graph-meta-editor').querySelectorAll('input');
    for (const input of inputs) {
      expect(input).toHaveProperty('disabled', true);
    }
  });
});
