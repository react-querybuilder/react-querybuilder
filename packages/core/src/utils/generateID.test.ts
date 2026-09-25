import type { generateID as GenerateID } from './generateID';
import { uuidV4regex } from './generateID';

const realCrypto = globalThis.crypto;
const realCryptoDesc = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

// `generateID` picks its impl from `globalThis.crypto` at module load, so swap the
// global, then import fresh copy. Portable across Vitest + `bun test` (Bun's `vi` lacks
// `stubGlobal`/`resetModules`): defineProperty for global, unique query for fresh module.
let importCount = 0;
const loadGenerateID = async (cryptoStub: unknown) => {
  Object.defineProperty(globalThis, 'crypto', {
    value: cryptoStub,
    configurable: true,
    writable: true,
  });
  const mod: { generateID: typeof GenerateID } = await import(`./generateID?v=${++importCount}`);
  return mod.generateID;
};

afterEach(() => {
  if (realCryptoDesc) {
    Object.defineProperty(globalThis, 'crypto', realCryptoDesc);
  } else {
    Reflect.deleteProperty(globalThis, 'crypto');
  }
});

const arr = Array.from({ length: 10_000 });

const expectValidUniqueIDs = (generateID: () => string) => {
  const ids = arr.map(() => generateID());
  for (const id of ids) expect(id).toMatch(uuidV4regex);
  expect(new Set(ids).size).toBe(ids.length);
};

it('uses crypto.randomUUID when available', async () => {
  const randomUUID = vi.fn(() => realCrypto.randomUUID());
  const generateID = await loadGenerateID({ randomUUID });
  expectValidUniqueIDs(generateID);
  expect(randomUUID).toHaveBeenCalled();
});

// Insecure (http) contexts: `randomUUID` missing, `getRandomValues` present
it('falls back to crypto.getRandomValues without randomUUID', async () => {
  const getRandomValues = vi.fn(<T extends ArrayBufferView>(a: T) => realCrypto.getRandomValues(a));
  const generateID = await loadGenerateID({ getRandomValues });
  expectValidUniqueIDs(generateID);
  expect(getRandomValues).toHaveBeenCalled();
});

it('falls back to Math.random when crypto lacks both methods', async () => {
  const generateID = await loadGenerateID({});
  expectValidUniqueIDs(generateID);
});

// Hermes (RN iOS/Android): no global `crypto`
it('falls back to Math.random without global crypto', async () => {
  const generateID = await loadGenerateID(undefined);
  expect(globalThis.crypto).toBeUndefined();
  expectValidUniqueIDs(generateID);
});
