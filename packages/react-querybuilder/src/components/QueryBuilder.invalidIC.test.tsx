/**
 * This is in a separate file from the other QueryBuilder tests because it's the easiest
 * way to isolate the import of the useDeprecatedProps module and get a "clean" test.
 */
import { render } from '@testing-library/react';
import * as React from 'react';
import { consoleMocks } from '../../genericTests';
import { errorInvalidIndependentCombinatorsProp } from '../messages';
import { QueryBuilder } from './QueryBuilder';

const { consoleError } = consoleMocks();

describe('deprecated props - invalid independentCombinators', () => {
  it('warns about invalid independentCombinators prop', () => {
    render(<QueryBuilder independentCombinators query={{ rules: [] }} />);
    expect(consoleError).not.toHaveBeenCalledWith(errorInvalidIndependentCombinatorsProp);
    render(<QueryBuilder independentCombinators query={{ combinator: 'and', rules: [] }} />);
    expect(consoleError).toHaveBeenCalledWith(errorInvalidIndependentCombinatorsProp);
  });
});
