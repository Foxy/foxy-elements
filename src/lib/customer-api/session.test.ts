import { describe, expect, it } from "vitest";
import { API } from "@foxy.io/sdk/customer";
import { MemoryStorage } from "./scoped-storage";
import { hasValidSession } from "./session";

function apiWithSession(session: unknown) {
  const storage = new MemoryStorage();

  if (session !== undefined) {
    storage.setItem(
      API.SESSION,
      typeof session === "string" ? session : JSON.stringify(session),
    );
  }

  return { storage } as Pick<API, "storage">;
}

const HOUR = 60 * 60;

describe("hasValidSession", () => {
  it("is false with no session at all", () => {
    expect(hasValidSession(apiWithSession(undefined))).toBe(false);
  });

  it("is true for a session that has not expired", () => {
    const session = {
      session_token: "t",
      expires_in: HOUR,
      date_created: new Date().toISOString(),
    };

    expect(hasValidSession(apiWithSession(session))).toBe(true);
  });

  it("is false for a session the SDK would already have discarded", () => {
    const session = {
      session_token: "t",
      expires_in: HOUR,
      date_created: new Date(Date.now() - 2 * HOUR * 1000).toISOString(),
    };

    expect(hasValidSession(apiWithSession(session))).toBe(false);
  });

  it("is false for a stored value that is not JSON", () => {
    expect(hasValidSession(apiWithSession("token"))).toBe(false);
  });

  it("is false for a stored null", () => {
    expect(hasValidSession(apiWithSession(null))).toBe(false);
  });

  it("keeps a session with no expiry fields, matching the SDK", () => {
    // `date_created + expires_in` is NaN here, and the SDK's own expiry check
    // (`... < Date.now()`) is false for NaN, so it keeps sending the session.
    expect(hasValidSession(apiWithSession({ session_token: "t" }))).toBe(true);
  });
});
