import {
  defaultPlaceholderLabel,
  QueryManager,
  type FullField,
  type RuleGroupType,
  type RuleType,
} from '@react-querybuilder/core';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useQueryManager } from './useQueryManager';

const user = userEvent.setup();

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

describe('useQueryManager', () => {
  describe('when given a manager instance', () => {
    it('returns the manager and its current query', () => {
      const qm = new QueryManager();
      const { result } = renderHook(() => useQueryManager(qm));

      expect(result.current[1]).toBe(qm);
      expect(result.current[0]).toBe(qm.getQuery());
    });

    it('does not construct a manager of its own', () => {
      const qm = new QueryManager();
      const { result } = renderHook(() => useQueryManager(qm));

      // Re-render with the same instance to confirm nothing was swapped in.
      expect(result.current[1]).toBe(qm);
    });

    it('re-renders when the query changes', () => {
      const qm = new QueryManager<RuleGroupType>(undefined, { fields });
      const { result } = renderHook(() => useQueryManager(qm));

      expect(result.current[0].rules).toHaveLength(0);

      act(() => {
        qm.add(qm.createRule());
      });

      expect(result.current[0].rules).toHaveLength(1);
      expect(result.current[0]).toBe(qm.getQuery());
    });

    it('tracks a manager instance swap', () => {
      const qm1 = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [] });
      const qm2 = new QueryManager<RuleGroupType>({ combinator: 'or', rules: [] });
      const { result, rerender } = renderHook(({ qm }) => useQueryManager(qm), {
        initialProps: { qm: qm1 },
      });

      expect(result.current[0].combinator).toBe('and');

      rerender({ qm: qm2 });

      expect(result.current[1]).toBe(qm2);
      expect(result.current[0].combinator).toBe('or');
    });
  });

  describe('when given a query and options', () => {
    it('creates a manager seeded with the query', () => {
      const { result } = renderHook(() =>
        useQueryManager({ combinator: 'or', rules: [] }, { fields })
      );

      expect(result.current[1]).toBeInstanceOf(QueryManager);
      expect(result.current[0].combinator).toBe('or');
    });

    it('creates a default query when called with no arguments', () => {
      const { result } = renderHook(() => useQueryManager());

      expect(result.current[0].combinator).toBe('and');
      expect(result.current[0].rules).toHaveLength(0);
    });

    it('keeps the same manager across re-renders with new object identities', () => {
      const { result, rerender } = renderHook(({ query }) => useQueryManager(query, { fields }), {
        initialProps: { query: { combinator: 'and', rules: [] } as RuleGroupType },
      });
      const firstManager = result.current[1];

      act(() => {
        firstManager.add(firstManager.createRule());
      });

      // A new query object on a later render must not blow away accumulated state.
      rerender({ query: { combinator: 'or', rules: [] } });

      expect(result.current[1]).toBe(firstManager);
      expect(result.current[0].combinator).toBe('and');
      expect(result.current[0].rules).toHaveLength(1);
    });

    it('re-renders when the query changes', () => {
      const { result } = renderHook(() => useQueryManager(undefined, { fields }));
      const qm = result.current[1];

      act(() => {
        qm.add(qm.createRule());
      });

      expect(result.current[0].rules).toHaveLength(1);
    });
  });

  describe('render behavior', () => {
    const renderCounter = () => {
      let renderCount = 0;
      const qm = new QueryManager<RuleGroupType>(undefined, { fields });
      const { result } = renderHook(() => {
        renderCount++;
        return useQueryManager(qm);
      });
      return { qm, result, getRenderCount: () => renderCount };
    };

    it('does not re-render for a no-op mutation', () => {
      const { qm, getRenderCount } = renderCounter();
      const before = getRenderCount();

      act(() => {
        // Nonexistent path: aborts without committing.
        qm.remove([99]);
      });

      expect(getRenderCount()).toBe(before);
    });

    it('re-renders once for a batch containing several changes', () => {
      const { qm, result, getRenderCount } = renderCounter();
      const before = getRenderCount();

      act(() => {
        qm.batch(() => {
          qm.add(qm.createRule());
          qm.add(qm.createRule());
          qm.add(qm.createRule());
        });
      });

      expect(result.current[0].rules).toHaveLength(3);
      expect(getRenderCount()).toBe(before + 1);
    });

    it('re-renders on undo and redo', () => {
      const qm = new QueryManager<RuleGroupType>(undefined, { fields, history: true });
      const { result } = renderHook(() => useQueryManager(qm));

      act(() => {
        qm.add(qm.createRule());
      });
      expect(result.current[0].rules).toHaveLength(1);

      act(() => {
        qm.undo();
      });
      expect(result.current[0].rules).toHaveLength(0);

      act(() => {
        qm.redo();
      });
      expect(result.current[0].rules).toHaveLength(1);
    });

    it('re-renders when the manager is reconfigured', () => {
      const { qm, result, getRenderCount } = renderCounter();
      const before = getRenderCount();

      act(() => {
        qm.reconfigure({ fields, autoSelectField: false });
      });

      // The query object is unchanged, but the new configuration must reach the consumer.
      expect(getRenderCount()).toBe(before + 1);
      expect(result.current[1].getFields()).toHaveLength(fields.length + 1);
    });

    it('surfaces reconfigured translations in the rendered output', async () => {
      const qm = new QueryManager<RuleGroupType>(undefined, { fields, autoSelectField: false });
      const CustomUI = () => {
        const [, manager] = useQueryManager(qm);
        return (
          <span data-testid="placeholder">{(manager.getFields() as FullField[])[0].label}</span>
        );
      };

      render(<CustomUI />);
      expect(screen.getByTestId('placeholder')).toHaveTextContent(defaultPlaceholderLabel);

      await act(async () => {
        qm.reconfigure({ translations: { fields: { placeholderLabel: 'Choisir un champ' } } });
      });

      expect(screen.getByTestId('placeholder')).toHaveTextContent('Choisir un champ');
    });

    it('does not re-render for a reconfigure that changes nothing', () => {
      const { qm, getRenderCount } = renderCounter();
      const before = getRenderCount();

      act(() => {
        // Structurally identical to the options already in effect, rebuilt as a caller in an
        // effect would. `reconfigure` gates itself, so nothing reaches the hook.
        qm.reconfigure({ fields: [...fields] });
      });

      expect(getRenderCount()).toBe(before);
      expect(qm.getConfigVersion()).toBe(0);
    });

    it('stops observing config changes after unmount', () => {
      const qm = new QueryManager<RuleGroupType>(undefined, { fields });
      const { unmount } = renderHook(() => useQueryManager(qm));

      unmount();

      expect(() => {
        qm.reconfigure({ listsAsArrays: true });
      }).not.toThrow();
      expect(qm.getConfigVersion()).toBe(1);
    });

    it('unsubscribes on unmount', () => {
      const qm = new QueryManager<RuleGroupType>(undefined, { fields });
      const { unmount } = renderHook(() => useQueryManager(qm));

      unmount();

      // No listeners remain, so this must not throw or schedule a React update.
      expect(() => {
        qm.add(qm.createRule());
      }).not.toThrow();
      expect(qm.getQuery().rules).toHaveLength(1);
    });
  });

  it('supports driving a custom UI', async () => {
    const CustomUI = () => {
      const [query, qm] = useQueryManager(undefined, { fields });
      return (
        <div>
          <button onClick={() => qm.add(qm.createRule())}>add</button>
          <span data-testid="count">{query.rules.length}</span>
          <span data-testid="field">{(query.rules[0] as RuleType)?.field ?? ''}</span>
        </div>
      );
    };

    render(<CustomUI />);

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    await user.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('field')).toHaveTextContent('firstName');
  });
});
