import type { UserConfig } from 'vite';
import { mergeConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

const config: UserConfig = mergeConfig(getCommonViteConfig({ port: 3108, scopedDonut: false }), {
  resolve: { alias: { 'react-native': 'react-native-web' } },
});

export default config;
