import { describe, expect, it } from "vitest";
import { assertReadSucceeded } from "./read";
import { UnauthenticatedError } from "./session";

describe("assertReadSucceeded", () => {
  it("returns silently on a successful response", () => {
    expect(() => assertReadSucceeded({ ok: true, status: 200 })).not.toThrow();
  });

  it("throws UnauthenticatedError on 401", () => {
    expect(() => assertReadSucceeded({ ok: false, status: 401 })).toThrow(
      UnauthenticatedError,
    );
  });

  it("throws UnauthenticatedError on 403", () => {
    expect(() => assertReadSucceeded({ ok: false, status: 403 })).toThrow(
      UnauthenticatedError,
    );
  });

  it("throws a plain Error on other failures", () => {
    let caught: unknown;
    try {
      assertReadSucceeded({ ok: false, status: 500 });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught).not.toBeInstanceOf(UnauthenticatedError);
    expect((caught as Error).message).toMatch(/500/);
  });

  it("treats a response that cannot report success as a failure", () => {
    expect(() => assertReadSucceeded({})).toThrow(Error);
    expect(() => assertReadSucceeded(null)).toThrow(Error);
  });
});
