/* eslint-disable unicorn/no-process-exit */
import { $ } from 'bun';

interface Problem {
  kind: string;
  resolutionKind?: string;
}

$.nothrow();

const json = await $`attw --format json --pack ${Bun.argv[2]}`.json();

if (!json.analysis.problems?.length) {
  console.log('No problems found.');
  process.exit(0);
}

if (
  json.analysis.problems.every(
    (p: Problem) =>
      p.kind === 'FalseExportDefault' ||
      (p.kind === 'NoResolution' && p.resolutionKind === 'node10')
  )
) {
  console.log('Only found `FalseExportDefault` and `node10` resolution problems.');
  process.exit(0);
}

await $`attw --format table-flipped --pack ${Bun.argv[2]}`;
process.exit(1);
