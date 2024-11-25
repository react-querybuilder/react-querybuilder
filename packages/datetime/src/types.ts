import type { RulesLogic } from 'json-logic-js';
import type { RQBJsonLogic } from 'react-querybuilder';

export interface RQBJsonLogicDateBetween {
  dateBetween: [RQBJsonLogic, RQBJsonLogic, RQBJsonLogic];
}
export interface RQBJsonLogicDateNotBetween {
  dateNotBetween: [RQBJsonLogic, RQBJsonLogic, RQBJsonLogic];
}
export interface RQBJsonLogicDateIn {
  dateIn: [RQBJsonLogic, RQBJsonLogic[]];
}
export interface RQBJsonLogicDateNotIn {
  dateNotIn: [RQBJsonLogic, RQBJsonLogic[]];
}
export interface RQBJsonLogicDateBefore {
  dateBefore: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicDateOnOrBefore {
  dateOnOrBefore: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicDateOn {
  dateOn: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicDateNotOn {
  dateNotOn: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicDateAfter {
  dateAfter: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}
export interface RQBJsonLogicDateOnOrAfter {
  dateOnOrAfter: [RQBJsonLogic, RQBJsonLogic, ...RQBJsonLogic[]];
}

/**
 * JsonLogic rule object with additional operators generated by {@link formatQuery}
 * and accepted by {@link parseJsonLogic}.
 */
export type RQBDateTimeJsonLogic =
  | RQBJsonLogic
  | RulesLogic<
      | RQBJsonLogicDateAfter
      | RQBJsonLogicDateBefore
      | RQBJsonLogicDateBetween
      | RQBJsonLogicDateIn
      | RQBJsonLogicDateNotBetween
      | RQBJsonLogicDateNotIn
      | RQBJsonLogicDateNotOn
      | RQBJsonLogicDateOn
      | RQBJsonLogicDateOnOrAfter
      | RQBJsonLogicDateOnOrBefore
    >;

type DateOrString = string | Date;

export interface RQBDateTimeLibraryAPI {
  /**
   * Formats a date as a string.
   */
  format: (d: DateOrString, fmt: string) => string;
  /**
   * Formats a date as an ISO 8601 string, only including
   * the year, month, and day ('YYYY-MM-DD').
   */
  toISOStringDayOnly: (d: DateOrString) => string;
  /**
   * Determines whether the first date is after the second date.
   */
  isAfter: (a: DateOrString, b: DateOrString) => boolean;
  /**
   * Determines whether the first date is before the second date.
   */
  isBefore: (a: DateOrString, b: DateOrString) => boolean;
  /**
   * Determines whether the first date is the same as the second date.
   *
   * If either the first date or the second date is a string in the
   * format 'YYYY-MM-DD', then the dates will only be compared at
   * the date level (no time component). Otherwise, they will be
   * compared to the millisecond.
   */
  isSame: (a: DateOrString, b: DateOrString) => boolean;
  /**
   * Determines whether the date is either a valid Date object or an
   * ISO 8601-formatted string representing a valid date.
   */
  isValid: (d: DateOrString) => boolean;
  /**
   * Converts a string to a Date object or returns a valid Date as is.
   */
  toDate: (d: DateOrString) => Date;
  /**
   * Converts a Date or ISO 8601-formatted string into a full ISO 8601 UTC
   * string, in the format 'YYYY-MM-DDTHH:mm:ss.SSSZ' (the "T" and "Z" are
   * static; other parts represent standard time units, increasing in precision
   * from left to right).
   */
  toISOString: (d: DateOrString) => string;
}

type FnDateDate = (a: DateOrString, b: DateOrString) => boolean;
type FnDateArrayOfDates = (a: DateOrString, b: DateOrString[]) => boolean;
type FnDateDateDate = (a: DateOrString, b: DateOrString, c: DateOrString) => boolean;

export type RQBJsonLogicDateTimeOperations = {
  /** Determines if the first date is after the second date. */
  dateAfter: FnDateDate;
  /** Determines if the first date is before the second date. */
  dateBefore: FnDateDate;
  /** Determines if the second date is between the first and third dates (inclusive). */
  dateBetween: FnDateDateDate;
  /** Determines if the first date is one of the values in the array of dates. */
  dateIn: FnDateArrayOfDates;
  /** Determines if the second date is not between the first and third dates. */
  dateNotBetween: FnDateDateDate;
  /** Determines if the first date is not one of the values in the array of dates. */
  dateNotIn: FnDateArrayOfDates;
  /** Determines if the first date is not the same as the second date. */
  dateNotOn: FnDateDate;
  /** Determines if the first date is the same as the second date (at the level of least precision between the two). */
  dateOn: FnDateDate;
  /** Determines if the first date is either the same as the second date or after it. */
  dateOnOrAfter: FnDateDate;
  /** Determines if the first date is either the same as the second date or before it. */
  dateOnOrBefore: FnDateDate;
};
