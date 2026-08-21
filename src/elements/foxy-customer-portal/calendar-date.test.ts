import { describe, expect, it } from "vitest";
import { toCalendarDate } from "./calendar-date";

describe("toCalendarDate", () => {
  it("returns null for null, undefined and an empty string", () => {
    expect(toCalendarDate(null)).toBeNull();
    expect(toCalendarDate(undefined)).toBeNull();
    expect(toCalendarDate("")).toBeNull();
  });

  it("returns null for the API's unset-date sentinel", () => {
    expect(toCalendarDate("0000-00-00")).toBeNull();
  });

  // The canonical wire shape: an offset-carrying ISO 8601 string with a real
  // time-of-day, late enough that naively parsing it as an instant and
  // formatting in a viewer timezone east of the store's rolls it to the next
  // day. '2023-02-11T22:45:01-0700' is 05:45:01Z on Feb 12 -- a viewer
  // anywhere from UTC to well east of it would see Feb 12 for what the store
  // considers Feb 11.
  it("keeps the store's calendar day for an offset-carrying timestamp late in the day", () => {
    const result = toCalendarDate("2023-02-11T22:45:01-0700");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2023);
    expect(result!.getMonth()).toBe(1); // 0-indexed: February
    expect(result!.getDate()).toBe(11);
  });

  it("keeps the store's calendar day for a colon-delimited offset", () => {
    const result = toCalendarDate("2013-06-06T17:26:07-05:00");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2013);
    expect(result!.getMonth()).toBe(5); // June
    expect(result!.getDate()).toBe(6);
  });

  it("handles a date-only string", () => {
    const result = toCalendarDate("2015-04-15");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2015);
    expect(result!.getMonth()).toBe(3); // April
    expect(result!.getDate()).toBe(15);
  });

  it("degrades to null instead of throwing on a malformed string", () => {
    expect(toCalendarDate("not-a-date")).toBeNull();
    expect(toCalendarDate("2023-13-45")).toBeNull();
  });
});
