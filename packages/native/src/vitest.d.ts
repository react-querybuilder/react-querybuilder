// RNTL only ships jest/@jest/expect matcher augmentations; add the vitest equivalent.
import type { JestNativeMatchers } from '@testing-library/react-native/dist/matchers/types';
import 'vitest';

declare module 'vitest' {
  interface Assertion<R, T> extends JestNativeMatchers<R> {}
  interface AsymmetricMatchersContaining extends JestNativeMatchers<void> {}
}
