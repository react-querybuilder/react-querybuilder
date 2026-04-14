import path from 'node:path';
import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    setupFiles: [
      path.resolve(import.meta.dirname, '../../vitestSetup.ts'),
      path.resolve(import.meta.dirname, './vitestSetup.ts'),
    ],
    deps: {
      optimizer: {
        web: {
          include: [
            'react-dnd',
            'react-dnd-html5-backend',
            'react-dnd-touch-backend',
            'dnd-core',
            /@react-dnd/,
          ],
        },
      },
    },
  },
});
