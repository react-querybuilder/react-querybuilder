import vitePluginReact from '@vitejs/plugin-react-swc';
import { defineProject } from 'vitest/config';

export default defineProject({
  define: {
    __RQB_DEV__: true,
  },
  plugins: [vitePluginReact()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: '../../vitest.setup.ts',
    css: false,
  },
});
