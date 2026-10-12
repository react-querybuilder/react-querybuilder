import type { UserConfigExport } from 'tsdown';
import { defineConfig } from 'tsdown';

// Node CLI + library: ESM only; deps external; docs index JSON bundled.
export default defineConfig({
  entry: { index: 'src/index.ts', cli: 'src/cli.ts' },
  format: 'esm',
  platform: 'node',
  target: 'node20',
  dts: { oxc: {} },
  sourcemap: true,
  clean: true,
  checks: { pluginTimings: false },
}) as UserConfigExport;
