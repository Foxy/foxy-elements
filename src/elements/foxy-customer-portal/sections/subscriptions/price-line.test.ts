import { describe, expect, it } from "vitest";
import { messages } from "../../messages";
import { parseFrequency } from "./price-line";

describe("parseFrequency", () => {
  it("reads a single-unit frequency", () => {
    expect(parseFrequency("1m")).toEqual({
      message: messages.subscriptionPricePerMonth,
      count: 1,
    });
    expect(parseFrequency("1y")).toEqual({
      message: messages.subscriptionPricePerYear,
      count: 1,
    });
  });

  it("reads a multi-unit frequency", () => {
    expect(parseFrequency("4w")).toEqual({
      message: messages.subscriptionPricePerWeek,
      count: 4,
    });
    expect(parseFrequency("3m")).toEqual({
      message: messages.subscriptionPricePerMonth,
      count: 3,
    });
  });

  it("reads every unit the API can send", () => {
    expect(parseFrequency("2d")?.message).toBe(messages.subscriptionPricePerDay);
    expect(parseFrequency("2w")?.message).toBe(
      messages.subscriptionPricePerWeek,
    );
    expect(parseFrequency("2m")?.message).toBe(
      messages.subscriptionPricePerMonth,
    );
    expect(parseFrequency("2y")?.message).toBe(
      messages.subscriptionPricePerYear,
    );
  });

  it("reads Foxy's fractional twice-a-month frequency", () => {
    expect(parseFrequency(".5m")).toEqual({
      message: messages.subscriptionPricePerMonth,
      count: 0.5,
    });
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseFrequency(" 1m ")?.count).toBe(1);
  });

  // Returning null rather than guessing is the point: the card falls back to
  // a bare price, because showing the wrong billing period is worse than
  // showing none at all.
  it("returns null for a frequency it cannot read", () => {
    expect(parseFrequency("")).toBeNull();
    expect(parseFrequency("1")).toBeNull();
    expect(parseFrequency("m")).toBeNull();
    expect(parseFrequency("1x")).toBeNull();
    expect(parseFrequency("0m")).toBeNull();
    expect(parseFrequency("-1m")).toBeNull();
    expect(parseFrequency("1m2")).toBeNull();
  });
});
