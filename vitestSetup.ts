import '@testing-library/jest-dom/vitest';
import { mockAnimationsApi, mockResizeObserver } from 'jsdom-testing-mocks';
import { vi } from 'vitest';

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = vi.fn();
}

// oxlint-disable-next-line prefer-global-this
if (typeof window !== 'undefined') {
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
