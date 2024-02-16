import { $ } from 'bun';

await $`rm -rf ../packages/*/node_modules website/node_modules`;
