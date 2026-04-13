import { vi } from 'vitest';

vi.mock('react-dom/test-utils', async () => ({
  // oxlint-disable-next-line typescript/consistent-type-imports
  act: (await vi.importActual<typeof import('react')>('react')).act,
}));
