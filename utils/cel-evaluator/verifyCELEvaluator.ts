import { $ } from 'bun';
import { test } from 'bun:test';

const skipGoCompiledTestsEnvVar = 'RQB_SKIP_GO_COMPILED_TESTS';

type CelEvaluator = (param: {
  data: unknown[];
  cel: string;
  typemap: Record<string, string>;
}) => Promise<unknown[]>;

export const verifyCELEvaluator = async (): Promise<false | CelEvaluator> => {
  $.nothrow();
  $.cwd(import.meta.dir);

  let buildInvalid = true;
  let buildOutdated = true;

  if (process.env[skipGoCompiledTestsEnvVar]) {
    // Bail out if we don't even want to try to run Go compiled tests
    test.skip(`CEL dbquery tests skipped - ${skipGoCompiledTestsEnvVar} env var set`, () => {});
    buildInvalid = true;
  } else {
    // Check if we need to rebuild the CEL evaluator
    const srcModifiedCheck =
      await $`git diff --name-only --cached ./cel-evaluator.go && git ls-files -m ./cel-evaluator.go`.text();
    const srcModified = !!srcModifiedCheck.trim();
    const srcLatestCommit = await $`git log -1 --format=%cd --date=unix ./cel-evaluator.go`.text();
    const srcLatestCommitMs = Number(srcLatestCommit) * 1000;
    const { mtimeMs: srcLastModifiedMs } = await Bun.file(
      `${import.meta.dir}/cel-evaluator.go`
    ).stat();
    const { mtimeMs: binLastModifiedMs } = await Bun.file(
      `${import.meta.dir}/cel-evaluator${process.platform === 'win32' ? '.exe' : ''}`
    )
      .stat()
      .catch(() => ({ mtimeMs: 0 }));

    buildInvalid = binLastModifiedMs === 0;
    buildOutdated =
      buildInvalid ||
      // Re: next two lines, `srcLastModifiedMs` may be later then `binLastModifiedMs`,
      // but if the source file isn't modified from the last commit then the build
      // is only outdated if the binary is older than the commit.
      (srcLastModifiedMs > binLastModifiedMs && srcModified) ||
      srcLatestCommitMs > binLastModifiedMs;

    if (buildInvalid || buildOutdated) {
      // We need to rebuild the CEL evaluator, so check if Go is installed
      const { exitCode: goVersionExitCode } = await $`go version`.quiet();
      if (goVersionExitCode > 0) {
        // Bail out if Go is not installed
        test.skip('CEL dbquery tests skipped - Go not installed', () => {});
        buildInvalid = true;
      } else {
        // Build CEL evaluator package with Go
        const { exitCode: goBuildExitCode } = await $`go build cel-evaluator.go`;
        buildInvalid = goBuildExitCode > 0;
        buildOutdated = buildOutdated && buildInvalid;
      }
    }

    if (buildInvalid && buildOutdated) {
      // CEL evaluator was outdated but rebuild failed
      test.skip('CEL dbquery tests skipped - CEL evaluator outdated; Go build failed', () => {});
    } else if (buildInvalid) {
      // Bail out if Go build failed
      test.skip('CEL dbquery tests skipped - Go build failed', () => {});
    }
  }

  return (
    !buildInvalid &&
    !buildOutdated &&
    (async ({ data, cel, typemap }) =>
      JSON.parse(
        await $`./cel-evaluator --json=${JSON.stringify(data)} --query=${cel} --types=${JSON.stringify(typemap)}`.text()
      ))
  );
};
