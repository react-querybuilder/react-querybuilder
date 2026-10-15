import type { RuleProcessor } from '@react-querybuilder/core';
import { toArray } from '@react-querybuilder/core';
import { getEpochMs } from './getEpochMs';
import type { RQBDateTimeLibraryAPI } from './types';
import { isNonDateValueSource, materializeForExport, processIsDateField } from './utils';

const listOps = new Set(['in', 'notin', 'between', 'notbetween']);

/**
 * Wraps a core rule processor for vector DBs w/o a date type (Pinecone, Chroma, Milvus):
 * date values (incl. relative) → epoch ms numbers. Unparseable values pass through.
 */
export const getEpochMsDatetimeRuleProcessor =
  (apiFns: RQBDateTimeLibraryAPI, coreProcessor: RuleProcessor): RuleProcessor =>
  (rule, options) => {
    const opts = options ?? /* v8 ignore start -- @preserve */ {}; /* v8 ignore stop -- @preserve */
    const { context = {} } = opts;

    if (
      isNonDateValueSource(rule.valueSource) ||
      !processIsDateField(context.isDateField, rule, opts)
    ) {
      return coreProcessor(rule, opts);
    }

    const { operator, value } = materializeForExport(apiFns, rule, opts);
    const toMs = (v: unknown) => getEpochMs(apiFns, v) ?? v;
    const msValue = listOps.has(operator.toLowerCase())
      ? toArray(value as string | unknown[]).map(toMs)
      : toMs(value);
    return coreProcessor({ ...rule, operator, value: msValue }, opts);
  };
