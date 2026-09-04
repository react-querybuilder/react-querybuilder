const originalWarn: typeof console.warn = console.warn;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('use-focus-trap')) return;
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
