import '@testing-library/jest-dom/vitest';
import { mockAnimationsApi, mockResizeObserver } from 'jsdom-testing-mocks';
import { vi } from 'vitest';

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn();
}

// oxlint-disable-next-line prefer-global-this
if (typeof window !== 'undefined') {
  // Suppress React act() warning caused by Vitest jsdom/Node context mismatch.
  // react-dom runs in Node's global scope (externalized) while tests run in
  // jsdom's VM, so globalThis.IS_REACT_ACT_ENVIRONMENT can't reach react-dom.
  const originalError = console.error;
  console.error = (...args: Parameters<typeof console.error>) => {
    if (typeof args[0] === 'string' && args[0].includes('not configured to support act')) {
      return;
    }
    originalError.apply(console, args);
  };

  mockAnimationsApi();
  mockResizeObserver();

  // oxlint-disable-next-line unicorn/prefer-global-this
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
