import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
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
