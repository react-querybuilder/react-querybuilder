import '@testing-library/jest-dom';
import value from 'node:crypto';
import 'regenerator-runtime/runtime';

Object.defineProperty(globalThis, 'crypto', { value });
