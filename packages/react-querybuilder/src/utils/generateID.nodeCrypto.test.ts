/**
 * @jest-environment node
 */
import nodeCrypto from 'node:crypto';
import { testGenerateID } from './generateIDTestUtils';

const ogCrypto = globalThis.crypto;

globalThis.crypto = nodeCrypto as unknown as Crypto;

// Delay the loading of generateID until after crypto has been defined
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { generateID } = require('./generateID');

// TODO: When our test runner supports ESM, we can do this instead:
// const { generateID } = await import('./generateID');

testGenerateID(generateID);

globalThis.crypto = ogCrypto;
