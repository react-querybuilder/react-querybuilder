import { testGenerateID } from '../../genericTests/generateIDtests';
import { generateID } from './generateID';

// These tests are run in the jsdom environment (browser-like, so crypto is
// available), but assuming an insecure protocol (so crypto.randomUUID() is
// not available).

it('should have access to crypto package, but not the randomUUID function', () => {
  expect(crypto).toBeDefined();
  expect(crypto.randomUUID).not.toBeDefined();
});

testGenerateID(generateID);
