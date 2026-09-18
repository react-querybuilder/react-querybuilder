import { mergeConfig } from 'vitest/config';
import shared from '../../utils/testing/vitest.shared.mjs';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    server: { deps: { inline: [/@fluentui[/\\]/] } },
  },
});
