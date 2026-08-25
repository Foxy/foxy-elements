import { describe, expect, it } from "vitest";
import { getTransactionStatusVariant } from "./transaction-status";

describe("getTransactionStatusVariant", () => {
  it("returns default for a completed-family status", () => {
    expect(getTransactionStatusVariant("")).toBe("default");
    expect(getTransactionStatusVariant("completed")).toBe("default");
    expect(getTransactionStatusVariant("captured")).toBe("default");
    expect(getTransactionStatusVariant("approved")).toBe("default");
    expect(getTransactionStatusVariant("authorized")).toBe("default");
    expect(getTransactionStatusVariant("verified")).toBe("default");
  });

  it("returns secondary for a refunded/voided status", () => {
    expect(getTransactionStatusVariant("refunded")).toBe("secondary");
    expect(getTransactionStatusVariant("refunding")).toBe("secondary");
    expect(getTransactionStatusVariant("voided")).toBe("secondary");
  });

  it("returns destructive for a failure status", () => {
    expect(getTransactionStatusVariant("declined")).toBe("destructive");
    expect(getTransactionStatusVariant("rejected")).toBe("destructive");
    expect(getTransactionStatusVariant("problem")).toBe("destructive");
  });

  it("defaults an unrecognized status to default rather than throwing", () => {
    expect(getTransactionStatusVariant("some_future_status")).toBe("default");
  });
});
