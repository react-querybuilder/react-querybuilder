// Generates the (gitignored) docs index if missing. Vitest may run under Node: shell out to Bun.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

export default function setup(): void {
  if (!existsSync(path.join(import.meta.dirname, 'src/generated/docs-index.json'))) {
    execFileSync('bun', ['../../utils/build-mcp-docs-index.ts'], {
      cwd: import.meta.dirname,
      stdio: 'inherit',
    });
  }
}
