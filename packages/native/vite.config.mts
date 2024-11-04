import { mergeConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

export default mergeConfig(getCommonViteConfig({ port: 3108, scopedDonut: false }), {
  resolve: { alias: { 'react-native': 'react-native-web' } },
});
