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
  $.cwd(import.meta.dirname);

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
      `${import.meta.dirname}/cel-evaluator.go`
    ).stat();
    const { mtimeMs: binLastModifiedMs } = await Bun.file(
      `${import.meta.dirname}/cel-evaluator${process.platform === 'win32' ? '.exe' : ''}`
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

  if (buildInvalid || buildOutdated) {
    return false;
  }

  // Spawn one persistent CEL evaluator (server mode) for the whole test file, amortizing the
  // process-startup + CEL-env cost across every query instead of paying it per test. Requests/
  // responses are newline-delimited JSON over stdin/stdout.
  const bin = `./cel-evaluator${process.platform === 'win32' ? '.exe' : ''}`;
  const proc = Bun.spawn([bin, '--server'], {
    cwd: import.meta.dirname,
    stdin: 'pipe',
    stdout: 'pipe',
    stderr: 'inherit',
  });
  // Don't keep the test process alive on account of the daemon; it exits on stdin EOF at teardown.
  proc.unref();

  // Buffered line reader over the daemon's stdout. Requests are issued sequentially (bun test awaits
  // each call), so a simple FIFO of pending resolvers is sufficient.
  const decoder = new TextDecoder();
  const reader = proc.stdout.getReader();
  const pending: ((line: string) => void)[] = [];
  let buffer = '';
  void (async () => {
    for (;;) {
      // Sequential by nature - a stream reader must await each chunk in order.
      // oxlint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        pending.shift()?.(line);
      }
    }
  })();

  const writer = proc.stdin;

  return async ({ data, cel, typemap }) => {
    const responseLine = new Promise<string>(resolve => pending.push(resolve));
    writer.write(`${JSON.stringify({ data, query: cel, types: typemap })}\n`);
    await writer.flush();
    return JSON.parse((await responseLine) || 'null');
  };
};
