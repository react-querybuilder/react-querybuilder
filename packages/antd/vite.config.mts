import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

export default defineConfig(getCommonViteConfig({ port: 3101 }));
