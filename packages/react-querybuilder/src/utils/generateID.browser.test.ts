import { generateID } from './generateID';
import { testGenerateID } from './generateIDTestUtils';

// Used to be undefined, like it would be in an insecure (http) context, but
// jsdom always defines crypto.randomUUID now so this test is unnecessary.
it.skip('should have access to crypto package, but not the randomUUID function', () => {
  expect(crypto).toBeDefined();
  expect(crypto.randomUUID).not.toBeDefined();
});

testGenerateID(generateID);
