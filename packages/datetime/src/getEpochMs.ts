import type { RQBDateTimeLibraryAPI } from './types';

/**
 * Converts a date (`Date` or parseable string) to epoch milliseconds using the given date
 * library API. Returns `undefined` if invalid. Used for vector DBs w/o a date type
 * (Pinecone, Chroma, Milvus); stored metadata must also be epoch ms.
 */
export const getEpochMs = (apiFns: RQBDateTimeLibraryAPI, value: unknown): number | undefined => {
  if (!(value instanceof Date) && typeof value !== 'string') return undefined;
  const d = apiFns.toDate(value);
  return apiFns.isValid(d) ? d.getTime() : undefined;
};
