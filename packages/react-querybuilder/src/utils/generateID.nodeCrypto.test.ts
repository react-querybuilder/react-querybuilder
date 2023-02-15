/**
 * @jest-environment node
 */
import crypto from 'node:crypto';
import { testGenerateID } from '../../genericTests/generateIDtests';

// These tests are run in the default node environment, but crypto is
// made available before loading generateID. Node assumes it's in a
// secure environment, so crypto.randomUUID is available.

it('should not have access to crypto package', () => {
  expect(globalThis.crypto).not.toBeDefined();
});

const ogCrypto = globalThis.crypto;

globalThis.crypto = crypto as Crypto;

// Delay the loading of generateID until after crypto has been defined
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateID } = require('./generateID');

testGenerateID(generateID);

globalThis.crypto = ogCrypto;
