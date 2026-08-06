/**
 * Accessibility coverage for the rendered tree.
 *
 * The scenario list is the same one the conformance harness uses, so a11y is asserted against
 * exactly the prop combinations DOM parity is asserted against. `scenarios.ts` and `queries.ts`
 * are self-contained — they carry no dependency on the downloaded fixture files — so this suite
 * runs under the default `bun run test` config.
 */

import type {
  FullCombinator,
  FullField,
  FullOperator,
  RuleGroupType,
} from '@react-querybuilder/core';
import { TestID } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { QueryBuilderHistory } from 'react-querybuilder/history';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { fields, scenarios } from '../../../../utils/conformance/scenarios';
import { queries } from '../../../../utils/testing/queryFixtures';
import type { QueryBuilderProps } from '../types';
import { QueryBuilder } from './QueryBuilder';

type QBP = QueryBuilderProps<RuleGroupType, FullField, FullOperator, FullCombinator>;

/**
 * WCAG 2.0/2.1 level A and AA. Axe's "best-practice" rules are asserted separately, because the
 * ported DOM knowingly violates one of them — see {@link acceptedBestPracticeViolations}.
 */
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * `label-title-only` fires on every selector and text editor in the tree: React Query Builder
 * labels them with `title` alone, and full DOM parity is a locked decision for this port, so
 * adding `aria-label` here would break the conformance harness. It is a best-practice rule, not
 * a WCAG failure — `title` does produce an accessible name, which is why the `label`/`aria-*`
 * rules at level A pass. Consumers who need a visible label can supply one through
 * `controlElements` or a slot.
 *
 * Listed rather than suppressed so that any *other* best-practice regression still fails.
 */
const acceptedBestPracticeViolations = ['label-title-only'];

/**
 * `vitest-axe`'s `toHaveNoViolations` matcher is not registered in this project's setup file, so
 * assert on the results directly.
 */
const expectNoViolations = async (container: Element): Promise<void> => {
  const wcag = await axe(container, { runOnly: wcagTags });
  expect(wcag.violations.map(v => `${v.id}: ${v.help}`)).toEqual([]);

  const bestPractice = await axe(container, { runOnly: ['best-practice'] });
  expect(bestPractice.violations.map(v => v.id).toSorted()).toEqual(acceptedBestPracticeViolations);
};

describe('accessibility', () => {
  for (const scenario of scenarios) {
    // One query per scenario is enough: the scenarios vary the controls, and the fixture queries
    // vary only the tree shape. `nested` exercises groups, rules, and depth at once.
    const query = (scenario.query ??
      queries[
        scenario.queries?.includes('nested') ? 'nested' : scenario.queries![0]
      ]) as RuleGroupType;

    it(`has no axe violations: ${scenario.name}`, async () => {
      // The scenario props are deliberately loose (see `scenarios.ts`), which defeats
      // `QueryBuilder`'s inference of its type parameters.
      const { container } = render(
        <QueryBuilder {...(scenario.props as QBP)} defaultQuery={query} />
      );

      await expectNoViolations(container);
    });
  }

  it('has no axe violations with every control and an independent-combinator query', async () => {
    const { container } = render(
      <QueryBuilderHistory>
        <QueryBuilder
          fields={fields}
          defaultQuery={queries.icNested}
          showNotToggle
          showCloneButtons
          showLockButtons
          showShiftActions
          showMuteButtons
          showUndoRedo
        />
      </QueryBuilderHistory>
    );

    await expectNoViolations(container);
  });
});

describe('keyboard navigation', () => {
  it('reaches every control in a rule row in document order', async () => {
    render(
      <QueryBuilder
        fields={fields}
        defaultQuery={queries.flat}
        showShiftActions
        showCloneButtons
        showLockButtons
      />
    );

    // The second rule, so that neither shift button is disabled and the whole row is tabbable.
    const rule = screen.getAllByTestId(TestID.rule)[1];
    const expected = [
      TestID.shiftActions,
      TestID.shiftActions,
      TestID.fields,
      TestID.operators,
      TestID.valueEditor,
      TestID.cloneRule,
      TestID.lockRule,
      TestID.removeRule,
    ];

    rule.querySelectorAll<HTMLElement>('button, select, input')[0].focus();

    const reached: string[] = [];
    for (let i = 0; i < expected.length; i++) {
      const active = document.activeElement as HTMLElement | null;
      expect(active && rule.contains(active)).toBe(true);
      reached.push(active!.closest('[data-testid]')!.getAttribute('data-testid')!);
      await userEvent.tab();
    }

    expect(reached).toEqual(expected);
    // The next tab leaves the rule entirely.
    expect(rule.contains(document.activeElement)).toBe(false);
  });

  it('activates a button control with the keyboard', async () => {
    render(<QueryBuilder fields={fields} defaultQuery={queries.singleRule} />);

    screen.getByTestId(TestID.addRule).focus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);

    screen.getAllByTestId(TestID.removeRule)[1].focus();
    await userEvent.keyboard(' ');

    expect(screen.getAllByTestId(TestID.rule)).toHaveLength(1);
  });

  it('associates the not-toggle label with its checkbox', async () => {
    render(<QueryBuilder fields={fields} defaultQuery={queries.singleRule} showNotToggle />);

    const checkbox = screen.getByLabelText('Not');
    expect(checkbox).toHaveAttribute('type', 'checkbox');

    checkbox.focus();
    await userEvent.keyboard(' ');

    expect(checkbox).toBeChecked();
  });
});
