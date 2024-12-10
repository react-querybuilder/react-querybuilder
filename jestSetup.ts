import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';

if (typeof Element !== 'undefined') Element.prototype.scrollIntoView = jest.fn();

// TODO: This is for Tremor. Maybe use `jsdom-testing-mocks` instead.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
