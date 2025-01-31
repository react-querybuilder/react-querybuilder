import '@testing-library/jest-dom';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import 'regenerator-runtime/runtime';

if (typeof Element !== 'undefined') Element.prototype.scrollIntoView = jest.fn();

if (typeof window !== 'undefined') mockResizeObserver();
