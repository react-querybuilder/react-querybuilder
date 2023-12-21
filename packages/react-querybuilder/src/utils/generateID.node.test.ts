/**
 * @jest-environment node
 */
import { testGenerateID } from '../../genericTests/generateIDtests';
import { generateID } from './generateID';

testGenerateID(generateID);
