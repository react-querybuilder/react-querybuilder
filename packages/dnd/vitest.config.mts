import { mergeConfig } from 'vitest/config';
import shared from '../../utils/testing/vitest.shared.mjs';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    setupFiles: ['../../utils/testing/vitestSetup.mts', './vitestSetup.mts'],
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
