import { mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared.mts';

export default mergeConfig(shared, {
  test: {
    environment: 'jsdom',
    server: { deps: { inline: [/@fluentui[/\\]/] } },
  },
});
