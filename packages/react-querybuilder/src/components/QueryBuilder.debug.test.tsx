import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { TestID, standardClassnames as sc } from '../defaults';
import { QueryBuilder } from './QueryBuilder.debug';

describe('debug mode', () => {
  it('has the correct role', () => {
    render(<QueryBuilder />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('has the correct className', () => {
    render(<QueryBuilder />);
    expect(screen.getByRole('form')).toHaveClass(sc.queryBuilder);
  });

  it('renders the root RuleGroup', () => {
    render(<QueryBuilder />);
    expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  });
});
