import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    // Inline primereact so Vite (not Node) resolves its imports.
    // Patterns are tested against resolved absolute paths, so they must not be `^`-anchored.
    server: {
      deps: {
        inline: [/primereact\//],
      },
    },
  },
});
