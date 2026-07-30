import type { RuleGroupType } from '@react-querybuilder/core';
import {
  standardClassnames as sc,
  TestID,
  defaultTranslations as t,
} from '@react-querybuilder/core';
import { consoleMocks } from '@rqb-testing';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useState } from 'react';
import { QueryBuilder } from '../../components/QueryBuilder';
import { messages } from '../../messages';
import type { ActionProps, UndoRedoActionsProps } from '../../types';
import { QueryBuilderHistory, UndoRedoActions } from '../index';

const { consoleError } = consoleMocks();
const user = userEvent.setup();

const fields = [{ name: 'f1', label: 'F1' }];
const startQuery: RuleGroupType = {
  id: 'g',
  combinator: 'and',
  rules: [{ id: 'r1', field: 'f1', operator: '=', value: '' }],
};

const undoRedo = () => screen.getByTestId(TestID.undoRedoActions);
const undoBtn = () => screen.getByTestId(TestID.undoAction);
const redoBtn = () => screen.getByTestId(TestID.redoAction);
const valueEditor = () => screen.getByTestId<HTMLInputElement>(TestID.valueEditor);

const Basic = (props: { showUndoRedo?: boolean }) => (
  <QueryBuilderHistory coalesceMs={0}>
    <QueryBuilder
      qbId="ui"
      fields={fields}
      defaultQuery={startQuery}
      showUndoRedo={props.showUndoRedo ?? true}
    />
  </QueryBuilderHistory>
);

describe('rendering', () => {
  it('renders undo/redo actions when showUndoRedo is true', () => {
    render(<Basic />);
    expect(undoRedo()).toBeInTheDocument();
    expect(undoRedo()).toHaveClass(sc.undoRedoActions);
  });

  it('does not render undo/redo actions by default', () => {
    render(<Basic showUndoRedo={false} />);
    expect(screen.queryByTestId(TestID.undoRedoActions)).toBeNull();
  });

  it('uses the default labels and titles', () => {
    render(<Basic />);
    expect(undoBtn()).toHaveTextContent(t.undo.label);
    expect(undoBtn()).toHaveAttribute('title', t.undo.title);
    expect(redoBtn()).toHaveTextContent(t.redo.label);
    expect(redoBtn()).toHaveAttribute('title', t.redo.title);
  });

  it('renders only in the header of the outermost group', async () => {
    render(<Basic />);
    await user.click(screen.getByTestId(TestID.addGroup));
    // A subgroup now exists, but there is still only one set of undo/redo actions
    expect(screen.getAllByTestId(TestID.ruleGroup)).toHaveLength(2);
    expect(screen.getAllByTestId(TestID.undoRedoActions)).toHaveLength(1);
  });

  it('accepts custom translations', () => {
    render(
      <QueryBuilderHistory>
        <QueryBuilder
          qbId="ui-t"
          fields={fields}
          defaultQuery={startQuery}
          showUndoRedo
          translations={{ undo: { label: 'U', title: 'Undo it' }, redo: { label: 'R' } }}
        />
      </QueryBuilderHistory>
    );
    expect(undoBtn()).toHaveTextContent('U');
    expect(undoBtn()).toHaveAttribute('title', 'Undo it');
    expect(redoBtn()).toHaveTextContent('R');
  });

  it('renders the buttons with the actionElement control element', () => {
    const CustomActionElement = (props: ActionProps) => (
      <button type="button" data-testid={props.testID} data-custom onClick={props.handleOnClick}>
        {props.label}
      </button>
    );

    render(
      <QueryBuilderHistory>
        <QueryBuilder
          qbId="ui-ae"
          fields={fields}
          defaultQuery={startQuery}
          showUndoRedo
          controlElements={{ actionElement: CustomActionElement }}
        />
      </QueryBuilderHistory>
    );

    expect(undoBtn()).toHaveAttribute('data-custom');
    expect(redoBtn()).toHaveAttribute('data-custom');
  });

  it('applies the standard and actionElement classnames to each button', () => {
    render(
      <QueryBuilderHistory>
        <QueryBuilder
          qbId="ui-bc"
          fields={fields}
          defaultQuery={startQuery}
          showUndoRedo
          controlClassnames={{ actionElement: 'custom-action', undoAction: 'custom-undo' }}
        />
      </QueryBuilderHistory>
    );

    expect(undoBtn()).toHaveClass(sc.undoAction, 'custom-action', 'custom-undo');
    expect(redoBtn()).toHaveClass(sc.redoAction, 'custom-action');
  });

  it('renders at the end of the outermost group header', () => {
    render(<Basic />);
    const header = screen
      .getAllByTestId(TestID.ruleGroup)[0]
      .querySelector(`.${sc.header}`) as HTMLElement;
    expect(header.lastElementChild).toBe(undoRedo());
  });

  it('renders immediately before the remove button when one is present', async () => {
    render(<Basic />);
    await user.click(screen.getByTestId(TestID.addGroup));
    // The outermost group has no remove button, so undo/redo remains last there
    const outerHeader = screen
      .getAllByTestId(TestID.ruleGroup)[0]
      .querySelector(`.${sc.header}`) as HTMLElement;
    expect(outerHeader.lastElementChild).toBe(undoRedo());
    // ...and the subgroup, which does have a remove button, has no undo/redo actions
    const innerHeader = screen
      .getAllByTestId(TestID.ruleGroup)[1]
      .querySelector(`.${sc.header}`) as HTMLElement;
    expect(within(innerHeader).queryByTestId(TestID.undoRedoActions)).toBeNull();
    expect(within(innerHeader).getByTestId(TestID.removeGroup)).toBeInTheDocument();
  });

  it('accepts a custom classname', () => {
    render(
      <QueryBuilderHistory>
        <QueryBuilder
          qbId="ui-c"
          fields={fields}
          defaultQuery={startQuery}
          showUndoRedo
          controlClassnames={{ undoRedoActions: 'custom-ur' }}
        />
      </QueryBuilderHistory>
    );
    expect(undoRedo()).toHaveClass(sc.undoRedoActions, 'custom-ur');
  });
});

describe('behavior', () => {
  it('is disabled until there is something to undo or redo', async () => {
    render(<Basic />);
    expect(undoBtn()).toBeDisabled();
    expect(redoBtn()).toBeDisabled();

    await user.type(valueEditor(), 'a');
    expect(undoBtn()).toBeEnabled();
    expect(redoBtn()).toBeDisabled();

    await user.click(undoBtn());
    expect(undoBtn()).toBeDisabled();
    expect(redoBtn()).toBeEnabled();
  });

  it('undoes and redoes edits', async () => {
    render(<Basic />);
    await user.type(valueEditor(), 'ab');
    expect(valueEditor().value).toBe('ab');

    await user.click(undoBtn());
    expect(valueEditor().value).toBe('a');

    await user.click(redoBtn());
    expect(valueEditor().value).toBe('ab');
  });

  it('works in controlled mode', async () => {
    const Controlled = () => {
      const [query, setQuery] = useState(startQuery);
      return (
        <QueryBuilderHistory coalesceMs={0}>
          <QueryBuilder
            qbId="ui-ctl"
            fields={fields}
            query={query}
            onQueryChange={setQuery}
            showUndoRedo
          />
        </QueryBuilderHistory>
      );
    };

    render(<Controlled />);
    await user.type(valueEditor(), 'ab');
    await user.click(undoBtn());
    expect(valueEditor().value).toBe('a');
  });

  it('respects the disabled prop', () => {
    render(
      <QueryBuilderHistory>
        <QueryBuilder qbId="ui-d" fields={fields} defaultQuery={startQuery} showUndoRedo disabled />
      </QueryBuilderHistory>
    );
    expect(undoBtn()).toBeDisabled();
    expect(redoBtn()).toBeDisabled();
  });
});

describe('without QueryBuilderHistory', () => {
  it('warns and renders nothing', () => {
    render(<QueryBuilder qbId="ui-np" fields={fields} defaultQuery={startQuery} showUndoRedo />);

    expect(screen.queryByTestId(TestID.undoRedoActions)).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(messages.errorShowUndoRedoWithoutProvider);
  });
});

describe('assigned directly as a control element', () => {
  // Documented alternative to QueryBuilderHistory: UndoRedoActions registers its own history
  // recording, so it works without the provider.
  it('records and navigates history without QueryBuilderHistory', async () => {
    render(
      <QueryBuilder
        qbId="ui-direct"
        fields={fields}
        defaultQuery={startQuery}
        showUndoRedo
        controlElements={{ undoRedoActions: UndoRedoActions }}
      />
    );

    expect(consoleError).not.toHaveBeenCalledWith(messages.errorShowUndoRedoWithoutProvider);
    expect(undoBtn()).toBeDisabled();

    await user.type(valueEditor(), 'ab');
    expect(undoBtn()).toBeEnabled();

    // The library default `coalesceMs` applies without a provider, so the typing burst is a
    // single undo step back to the pre-edit value.
    await user.click(undoBtn());
    expect(valueEditor().value).toBe('');
    expect(redoBtn()).toBeEnabled();

    await user.click(redoBtn());
    expect(valueEditor().value).toBe('ab');
  });
});

describe('custom undoRedoActions component', () => {
  const CustomUndoRedo = (props: UndoRedoActionsProps) => (
    <div data-testid={props.testID}>custom for {props.schema.qbId}</div>
  );

  it('is used instead of the default', () => {
    render(
      <QueryBuilderHistory>
        <QueryBuilder
          qbId="ui-custom"
          fields={fields}
          defaultQuery={startQuery}
          showUndoRedo
          controlElements={{ undoRedoActions: CustomUndoRedo }}
        />
      </QueryBuilderHistory>
    );
    expect(undoRedo()).toHaveTextContent('custom for ui-custom');
  });

  it('satisfies showUndoRedo without QueryBuilderHistory', () => {
    render(
      <QueryBuilder
        qbId="ui-custom-np"
        fields={fields}
        defaultQuery={startQuery}
        showUndoRedo
        controlElements={{ undoRedoActions: CustomUndoRedo }}
      />
    );
    expect(undoRedo()).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalledWith(messages.errorShowUndoRedoWithoutProvider);
  });
});
