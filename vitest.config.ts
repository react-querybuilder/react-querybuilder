import path from 'node:path';
import { defineConfig } from 'vitest/config';

// ANSI bg names (8 + bright). LabelColor omits bright, but they work at runtime.
type AnsiBg =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'blackBright'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';

// Labels/colors: nearest ANSI-16 to `concurrently` typecheck hex palette (hex unsupported).
const projects: Record<string, AnsiBg> = {
  antd: 'blue', // #0958d9
  bootstrap: 'magentaBright', // #712cf9
  bulma: 'cyan', // #00d1b2
  chakra: 'cyanBright', // #81e6d9
  core: 'magenta', // #663399
  datetime: 'cyan', // cyan
  dnd: 'blue', // #4078c0
  expressions: 'yellowBright', // arithmetic/function expressions
  fluent: 'greenBright', // #7fba00
  mantine: 'blueBright', // #339af0
  material: 'blue', // #007fff
  native: 'cyanBright', // #61dafb
  prime: 'cyan', // #06b6d4
  'react-querybuilder': 'blueBright', // #82a7dd
  'rules-engine': 'green', // #006633
  tremor: 'blueBright', // #60a5fa
};

export default defineConfig({
  test: {
    projects: Object.entries(projects).map(([dir, color]) => ({
      extends: `./packages/${dir}/vitest.config.ts`,
      // `extends` doesn't inherit the package dir as root; set it so test globs scope correctly.
      root: path.resolve(import.meta.dirname, 'packages', dir),
      // *Bright variants are absent from LabelColor.
      test: { name: { label: dir, color: color as 'blue' } },
    })),
    coverage: {
      provider: 'v8',
      exclude: [
        'utils/testing/**',
        'packages/*/dist/**',
        '**/*TestUtils.ts',
        // Package-specific exclusions
        'packages/antd/src/dayjs.ts',
        'packages/chakra/src/snippets/**',
        'packages/dnd/src/isHotkeyPressed.ts',
        'packages/rules-engine/src/components/**',
        'packages/core/src/utils/parse{CEL,SQL}/{cel,sql}Parser.ts',
        'packages/core/src/utils/parse{Cypher,Gremlin,SPARQL}/parse{Cypher,Gremlin,SPARQL}.ts',
      ],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
});
