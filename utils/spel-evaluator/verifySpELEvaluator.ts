import { $ } from 'bun';
import { test } from 'bun:test';
import type { SpELEvaluator } from './spel2jsEvaluator';

const skipJavaCompiledTestsEnvVar = 'RQB_SKIP_JAVA_COMPILED_TESTS';

// Pinned dependency jars fetched from Maven Central into the gitignored `lib/` directory. A custom
// MapAccessor (see SpelEvaluator.java) lets us depend only on spring-expression (+ spring-core /
// spring-jcl transitive) and Jackson, avoiding spring-context.
const mavenBase = 'https://repo1.maven.org/maven2';
const springVersion = '6.1.14';
const jacksonVersion = '2.17.2';
const jars: { path: string; file: string }[] = [
  {
    path: `org/springframework/spring-expression/${springVersion}`,
    file: `spring-expression-${springVersion}.jar`,
  },
  {
    path: `org/springframework/spring-core/${springVersion}`,
    file: `spring-core-${springVersion}.jar`,
  },
  {
    path: `org/springframework/spring-jcl/${springVersion}`,
    file: `spring-jcl-${springVersion}.jar`,
  },
  {
    path: `com/fasterxml/jackson/core/jackson-databind/${jacksonVersion}`,
    file: `jackson-databind-${jacksonVersion}.jar`,
  },
  {
    path: `com/fasterxml/jackson/core/jackson-core/${jacksonVersion}`,
    file: `jackson-core-${jacksonVersion}.jar`,
  },
  {
    path: `com/fasterxml/jackson/core/jackson-annotations/${jacksonVersion}`,
    file: `jackson-annotations-${jacksonVersion}.jar`,
  },
];

const classpathSep = process.platform === 'win32' ? ';' : ':';

export const verifySpELEvaluator = async (): Promise<false | SpELEvaluator> => {
  $.nothrow();
  $.cwd(import.meta.dirname);

  const dir = import.meta.dirname;
  const libDir = `${dir}/lib`;
  const classpath = [dir, ...jars.map(j => `${libDir}/${j.file}`)].join(classpathSep);

  if (process.env[skipJavaCompiledTestsEnvVar]) {
    test.skip(`SpEL Java dbquery tests skipped - ${skipJavaCompiledTestsEnvVar} env var set`, () => {});
    return false;
  }

  // Require a JDK (java + javac).
  const { exitCode: javaExit } = await $`java -version`.quiet();
  const { exitCode: javacExit } = await $`javac -version`.quiet();
  if (javaExit > 0 || javacExit > 0) {
    test.skip('SpEL Java dbquery tests skipped - JDK (java/javac) not installed', () => {});
    return false;
  }

  // Download any missing jars. Sequential by design (early-exit on first failure, cheap existence
  // checks), so the await-in-loop warnings are intentionally suppressed.
  /* oxlint-disable no-await-in-loop */
  for (const jar of jars) {
    const dest = `${libDir}/${jar.file}`;
    if (await Bun.file(dest).exists()) continue;
    const url = `${mavenBase}/${jar.path}/${jar.file}`;
    const response = await fetch(url);
    if (!response.ok) {
      test.skip(`SpEL Java dbquery tests skipped - failed to download ${jar.file}`, () => {});
      return false;
    }
    await Bun.write(dest, await response.arrayBuffer());
  }
  /* oxlint-enable no-await-in-loop */

  // Rebuild the class if source is newer than the compiled artifact (or artifact missing).
  const { mtimeMs: srcMtime } = await Bun.file(`${dir}/SpelEvaluator.java`).stat();
  const { mtimeMs: clsMtime } = await Bun.file(`${dir}/SpelEvaluator.class`)
    .stat()
    .catch(() => ({ mtimeMs: 0 }));
  if (clsMtime === 0 || srcMtime > clsMtime) {
    const { exitCode: javacBuildExit } = await $`javac -cp ${classpath} SpelEvaluator.java`.quiet();
    if (javacBuildExit > 0) {
      test.skip('SpEL Java dbquery tests skipped - javac build failed', () => {});
      return false;
    }
  }

  // Spawn one persistent JVM (server mode) for the whole test file, amortizing the ~0.4s JVM
  // startup across every query instead of paying it per test. Requests/responses are newline-
  // delimited JSON over stdin/stdout.
  const proc = Bun.spawn(['java', '-cp', classpath, 'SpelEvaluator', '--server'], {
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

  return async ({ data, spel }) => {
    const responseLine = new Promise<string>(resolve => pending.push(resolve));
    writer.write(`${JSON.stringify({ data, query: spel })}\n`);
    await writer.flush();
    return JSON.parse((await responseLine) || '[]');
  };
};
