import '@testing-library/jest-dom';
import { mockAnimationsApi, mockResizeObserver } from 'jsdom-testing-mocks';
import 'regenerator-runtime/runtime';

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}

if (typeof window !== 'undefined') {
  mockAnimationsApi();
  mockResizeObserver();
}
