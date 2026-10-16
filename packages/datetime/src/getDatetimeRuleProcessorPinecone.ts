import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorPinecone } from '@react-querybuilder/core';
import { getEpochMsDatetimeRuleProcessor } from './epochMsRuleProcessor';
import type { RQBDateTimeLibraryAPI } from './types';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "pinecone" format.
 * Pinecone has no date type, so date values (incl. relative) are emitted as epoch ms numbers;
 * stored metadata must also be epoch ms.
 */
export const getDatetimeRuleProcessorPinecone = (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  getEpochMsDatetimeRuleProcessor(apiFns, defaultRuleProcessorPinecone);
