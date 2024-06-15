/**
 * @jest-environment node
 */
import { generateID } from './generateID';
import { testGenerateID } from './generateIDTestUtils';

testGenerateID(generateID);
