import { afterEach, describe, expect, it, vi } from "vitest";
import { API, type StoredSession } from "@foxy.io/sdk/customer";
import { MemoryStorage } from "./scoped-storage";
import { forgetSession, hasValidSession, persistSession } from "./session";

const HOUR = 60 * 60;

function savedSession(overrides: Partial<StoredSession> = {}): StoredSession {
  return {
    session_token: "5c1b0f0e2d7a4e9c8f3b6a1d",
    jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.c2lnbmF0dXJl",
    expires_in: HOUR,
    date_created: new Date().toISOString(),
    ...overrides,
  };
}

function newApi() {
  return new API({
    base: new URL("https://demo.foxycart.com/s/customer/"),
    level: 1,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("hasValidSession", () => {
  it("is false with no session at all", () => {
    expect(hasValidSession({ session: null })).toBe(false);
  });

  it("is true for a session that has not expired", () => {
    expect(hasValidSession({ session: savedSession() })).toBe(true);
  });

  it("is false for a session the SDK would already have discarded", () => {
    const session = savedSession({
      date_created: new Date(Date.now() - 2 * HOUR * 1000).toISOString(),
    });

    expect(hasValidSession({ session })).toBe(false);
  });
});

describe("persistSession", () => {
  it("restores a saved valid session into the API", () => {
    const storage = new MemoryStorage();
    const session = savedSession();
    storage.setItem("session", JSON.stringify(session));

    const api = newApi();
    persistSession(api, storage);

    expect(api.session).toEqual(session);
  });

  it("drops a saved value that is not JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem("session", "token");

    const api = newApi();
    persistSession(api, storage);

    expect(api.session).toBeNull();
    expect(storage.getItem("session")).toBeNull();
  });

  it("drops a saved session the SDK rejects", () => {
    const storage = new MemoryStorage();
    const { jwt: _jwt, ...withoutJwt } = savedSession();
    storage.setItem("session", JSON.stringify(withoutJwt));

    const api = newApi();
    persistSession(api, storage);

    expect(api.session).toBeNull();
    expect(storage.getItem("session")).toBeNull();
  });

  it("saves the session when the API dispatches one", () => {
    const storage = new MemoryStorage();
    const api = newApi();
    persistSession(api, storage);

    api.setSession(savedSession());
    api.usesTemporaryPassword = true;

    expect(JSON.parse(storage.getItem("session")!)).toEqual(api.session);
    expect(JSON.parse(storage.getItem("session")!).force_password_reset).toBe(
      true,
    );
  });

  it("removes the saved session when the API dispatches null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );

    const storage = new MemoryStorage();
    storage.setItem("session", JSON.stringify(savedSession()));
    const api = newApi();
    persistSession(api, storage);

    await api.signOut();

    expect(api.session).toBeNull();
    expect(storage.getItem("session")).toBeNull();
  });
});

describe("forgetSession", () => {
  it("clears the session and its saved copy without dispatching an event", () => {
    const storage = new MemoryStorage();
    storage.setItem("session", JSON.stringify(savedSession()));
    const api = newApi();
    persistSession(api, storage);
    const onSession = vi.fn();
    api.addEventListener("session", onSession);

    forgetSession(api);

    expect(api.session).toBeNull();
    expect(storage.getItem("session")).toBeNull();
    expect(onSession).not.toHaveBeenCalled();
  });
});
