/**
 * @jest-environment node
 */
import { generateID } from './generateID';
import { testGenerateID } from './generateIDtests';

// These tests are run in the default node environment, so crypto is not available.

it('should not have access to crypto package', () => {
  expect(globalThis.crypto).not.toBeDefined();
});

testGenerateID(generateID);
