import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';

if (typeof Element !== 'undefined') Element.prototype.scrollIntoView = jest.fn();
