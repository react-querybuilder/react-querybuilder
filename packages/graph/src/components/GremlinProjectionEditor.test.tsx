// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GremlinProjectionEditor } from './GremlinProjectionEditor';

describe('GremlinProjectionEditor', () => {
  it('should render with default traversalSource', () => {
    const handleChange = vi.fn();
    render(<GremlinProjectionEditor onTraversalSourceChange={handleChange} />);
    expect(screen.getByTestId('gremlin-projection-editor')).toBeDefined();
    expect(screen.getByDisplayValue('g')).toBeDefined();
  });

  it('should render with custom traversalSource', () => {
    const handleChange = vi.fn();
    render(
      <GremlinProjectionEditor traversalSource="myGraph" onTraversalSourceChange={handleChange} />
    );
    expect(screen.getByDisplayValue('myGraph')).toBeDefined();
  });

  it('should call onTraversalSourceChange on input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<GremlinProjectionEditor traversalSource="" onTraversalSourceChange={handleChange} />);
    const input = screen.getByPlaceholderText('g');
    await user.type(input, 'g');
    expect(handleChange).toHaveBeenCalledWith('g');
  });

  it('should respect disabled prop', () => {
    const handleChange = vi.fn();
    render(<GremlinProjectionEditor onTraversalSourceChange={handleChange} disabled />);
    expect(screen.getByRole('textbox')).toHaveProperty('disabled', true);
  });
});
