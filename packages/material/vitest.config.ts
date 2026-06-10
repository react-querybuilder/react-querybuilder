import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    // Inline MUI/Emotion so Vite (not Node) resolves their imports. Required since MUI 9.1,
    // whose Transition.mjs uses a bare directory import that native ESM resolution rejects.
    // Patterns are tested against resolved absolute paths, so they must not be `^`-anchored.
    server: {
      deps: {
        inline: [/@mui\//, /@emotion\//],
      },
    },
  },
});
