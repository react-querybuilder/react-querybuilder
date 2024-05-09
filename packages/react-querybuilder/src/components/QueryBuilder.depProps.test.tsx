/**
 * This is in a separate file from the other QueryBuilder tests because it's the easiest
 * way to isolate the import of the useDeprecatedProps module and get a "clean" test.
 */
import { render } from '@testing-library/react';
import * as React from 'react';
import { consoleMocks } from '../../genericTests';
import { messages } from '../messages';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type QB = typeof import('./QueryBuilder');

const { consoleError } = consoleMocks();

describe('deprecated props - unnecessary independentCombinators', () => {
  it('warns about unnecessary independentCombinators prop', () => {
    const { QueryBuilder } = jest.requireActual<QB>('./QueryBuilder');
    render(<QueryBuilder query={{ rules: [] }} />);
    expect(consoleError).not.toHaveBeenCalledWith(
      messages.errorUnnecessaryIndependentCombinatorsProp
    );
    // independentCombinators is unnecessary even if it's false
    render(<QueryBuilder independentCombinators={false} query={{ rules: [] }} />);
    expect(consoleError).toHaveBeenCalledWith(messages.errorUnnecessaryIndependentCombinatorsProp);
  });
});

describe('deprecated props - invalid independentCombinators', () => {
  it('warns about invalid independentCombinators prop', () => {
    const { QueryBuilder } = jest.requireActual<QB>('./QueryBuilder');
    render(<QueryBuilder independentCombinators query={{ rules: [] }} />);
    expect(consoleError).not.toHaveBeenCalledWith(messages.errorInvalidIndependentCombinatorsProp);
    render(<QueryBuilder independentCombinators query={{ combinator: 'and', rules: [] }} />);
    expect(consoleError).toHaveBeenCalledWith(messages.errorInvalidIndependentCombinatorsProp);
  });
});
