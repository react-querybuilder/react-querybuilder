import { defaultCoalesceMs } from '../defaults';
import { shouldCoalesce } from './coalesce';
import { structuralSignature } from './signature';

describe('shouldCoalesce', () => {
  it('coalesces a matching signature within the window', () => {
    expect(shouldCoalesce('value', 'value', 0, 100, 500)).toBe(true);
  });

  it('never coalesces structural changes', () => {
    expect(shouldCoalesce(structuralSignature, structuralSignature, 0, 1, 500)).toBe(false);
  });

  it('does not coalesce when the signatures differ', () => {
    expect(shouldCoalesce('value', 'operator', 0, 1, 500)).toBe(false);
  });

  it('does not coalesce when there is no previous signature', () => {
    expect(shouldCoalesce(undefined, 'value', 0, 1, 500)).toBe(false);
  });

  it('does not coalesce when prevAt is in the future', () => {
    expect(shouldCoalesce('value', 'value', 100, 10, 500)).toBe(false);
  });

  it('does not coalesce after the window expires', () => {
    expect(shouldCoalesce('value', 'value', 0, 500, 500)).toBe(false);
    expect(shouldCoalesce('value', 'value', 0, 501, 500)).toBe(false);
  });

  it('defaults the window to defaultCoalesceMs', () => {
    expect(shouldCoalesce('value', 'value', 0, defaultCoalesceMs - 1)).toBe(true);
    expect(shouldCoalesce('value', 'value', 0, defaultCoalesceMs)).toBe(false);
  });
});
