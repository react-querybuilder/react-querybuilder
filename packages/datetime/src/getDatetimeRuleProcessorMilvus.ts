import type { RuleProcessor } from '@react-querybuilder/core';
import { defaultRuleProcessorMilvus } from '@react-querybuilder/core';
import { getEpochMsDatetimeRuleProcessor } from './epochMsRuleProcessor';
import type { RQBDateTimeLibraryAPI } from './types';

/**
 * Generates a rule processor with date/time features for use by
 * {@link @react-querybuilder/core!formatQuery formatQuery} with the "milvus" format.
 * Milvus has no date type, so date values (incl. relative) are emitted as epoch ms numbers;
 * stored metadata must also be epoch ms.
 */
export const getDatetimeRuleProcessorMilvus = (apiFns: RQBDateTimeLibraryAPI): RuleProcessor =>
  getEpochMsDatetimeRuleProcessor(apiFns, defaultRuleProcessorMilvus);
