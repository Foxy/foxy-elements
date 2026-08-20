import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { API } from "@foxy.io/sdk/customer";
import { mountScreen, setInputValue, type MountedScreen } from "./test-utils";
import { resetHCaptchaLoaderForTests } from "./hcaptcha";
import { Portal } from "./view";

let screen: MountedScreen | null = null;

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

type SettingsResponse = {
  sign_up?: {
    enabled: boolean;
    verification: { type: "hcaptcha"; site_key: string };
  };
};

let settingsResponse: SettingsResponse;
let fetchMock: ReturnType<typeof vi.fn>;
let solveCaptcha: ((token: string) => void) | null = null;

beforeEach(() => {
  // The sign-up screen renders an hCaptcha widget on mount. Same stub shape as
  // `screens/sign-up.test.tsx`: no test may load the real script.
  resetHCaptchaLoaderForTests();
  solveCaptcha = null;
  (window as { hcaptcha?: unknown }).hcaptcha = {
    render: (
      _host: HTMLElement,
      options: { callback(token: string): void },
    ) => {
      solveCaptcha = options.callback;
      return "widget-1";
    },
    reset: vi.fn(),
  };

  settingsResponse = {
    sign_up: {
      enabled: false,
      verification: { type: "hcaptcha", site_key: "" },
    },
  };
  fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => settingsResponse,
  }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  screen?.unmount();
  screen = null;
  delete (window as { hcaptcha?: unknown }).hcaptcha;
  solveCaptcha = null;
  vi.unstubAllGlobals();
});

const ada = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "",
  _links: {
    self: { href: "/c", patch: vi.fn(async () => ({ ok: true, status: 200 })) },
  },
};

/** A stored session shaped the way the SDK writes one. */
function session(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    session_token: "t",
    expires_in: 3600,
    date_created: new Date().toISOString(),
    ...overrides,
  });
}

/** A session the SDK's own expiry check would already have thrown away. */
function expiredSession() {
  return session({
    expires_in: 60,
    date_created: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  });
}

// A minimal double of `@foxy.io/sdk/customer`'s `API`: `storage` is a real
// Map-backed Storage so `API.SESSION` round-trips exactly like production,
// and every method the router or a routed screen touches is stubbed.
// `get` resolves with `ok` and `status` because the real client does, and
// because those are the only thing that distinguishes a signed-in read from a
// 401 — the SDK parses either body without complaint.
function fakeApi(overrides: Record<string, unknown> = {}) {
  const store = new Map<string, string>();

  const storage: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };

  return {
    base: new URL("https://demo.foxycart.com/s/customer/"),
    storage,
    usesTemporaryPassword: false,
    signIn: vi.fn(async () => {
      store.set(API.SESSION, session());
    }),
    signUp: vi.fn(async () => {}),
    signOut: vi.fn(async () => {
      store.delete(API.SESSION);
    }),
    sendPasswordResetEmail: vi.fn(async () => {}),
    get: vi.fn(async () => ({ ok: true, status: 200, json: async () => ada })),
    ...overrides,
  };
}

function render(api: unknown, props: Record<string, unknown> = {}) {
  screen = mountScreen(
    <Portal
      fullNameTemplate={
        (props.fullNameTemplate as string) ?? "{first_name} {last_name}"
      }
      skipPasswordReset={(props.skipPasswordReset as boolean) ?? false}
      onEvent={
        (props.onEvent as (type: string, detail?: unknown) => void) ?? vi.fn()
      }
    />,
    api,
  );
}

function submitSignIn(email = "ada@example.com", password = "hunter2") {
  const host = screen!.host;
  const emailInput = host.querySelector<HTMLInputElement>(
    'input[type="email"]',
  )!;
  const passwordInput = host.querySelector<HTMLInputElement>(
    'input[type="password"]',
  )!;

  act(() => {
    setInputValue(emailInput, email);
    setInputValue(passwordInput, password);
  });

  act(() => {
    host
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

function clickButtonMatching(pattern: RegExp) {
  const host = screen!.host;
  act(() => {
    const buttons = [...host.querySelectorAll("button")];
    const match = buttons.find((b) =>
      pattern.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
    );
    match!.click();
  });
}

describe("Portal", () => {
  it("shows sign-in when there is no session", async () => {
    render(fakeApi());
    await flush();

    expect(screen!.host.textContent).toMatch(/sign in/i);
  });

  it("shows account directly when a session already exists", async () => {
    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());
    render(api);
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
  });

  it("moves to account after a normal sign-in and fires signin with no detail", async () => {
    const onEvent = vi.fn();
    render(fakeApi(), { onEvent });
    await flush();

    submitSignIn();
    await flush();
    await flush();

    expect(onEvent.mock.calls[0]).toEqual(["signin"]);
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
  });

  it("moves to password-reset after signing in with a temporary password", async () => {
    render(fakeApi({ usesTemporaryPassword: true }));
    await flush();

    submitSignIn();
    await flush();

    expect(screen!.host.textContent).toMatch(/choose a new password/i);
  });

  it("skips password-reset when skipPasswordReset is set, even with a temporary password", async () => {
    render(fakeApi({ usesTemporaryPassword: true }), {
      skipPasswordReset: true,
    });
    await flush();

    submitSignIn();
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
  });

  it("fires passwordreset with result completed and shows account", async () => {
    const onEvent = vi.fn();
    render(fakeApi({ usesTemporaryPassword: true }), { onEvent });
    await flush();

    submitSignIn();
    await flush();

    const host = screen!.host;
    const [next, confirm] = [
      ...host.querySelectorAll<HTMLInputElement>('input[type="password"]'),
    ];
    act(() => {
      setInputValue(next, "new-secret1");
      setInputValue(confirm, "new-secret1");
    });
    act(() => {
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();
    await flush();

    expect(onEvent.mock.calls.at(-1)).toEqual([
      "passwordreset",
      { result: "completed" },
    ]);
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
  });

  it("fires passwordreset with result skipped and shows account", async () => {
    const onEvent = vi.fn();
    render(fakeApi({ usesTemporaryPassword: true }), { onEvent });
    await flush();

    submitSignIn();
    await flush();

    clickButtonMatching(/skip for now/i);
    await flush();
    await flush();

    expect(onEvent.mock.calls.at(-1)).toEqual([
      "passwordreset",
      { result: "skipped" },
    ]);
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
  });

  it("fires signout with no detail and returns to sign-in", async () => {
    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());
    const onEvent = vi.fn();
    render(api, { onEvent });
    await flush();
    await flush();

    clickButtonMatching(/sign out/i);
    await flush();

    expect(onEvent.mock.calls.at(-1)).toEqual(["signout"]);
    expect(screen!.host.textContent).toMatch(/sign in/i);
  });

  it("enables sign-up only when settings say so", async () => {
    settingsResponse = {
      sign_up: {
        enabled: true,
        verification: { type: "hcaptcha", site_key: "key" },
      },
    };
    render(fakeApi());
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/create an account/i);
  });

  it("goes to access recovery and back to sign-in", async () => {
    render(fakeApi());
    await flush();

    clickButtonMatching(/forgot password/i);
    expect(screen!.host.textContent).toMatch(/recover access/i);

    clickButtonMatching(/back to sign in/i);
    expect(screen!.host.textContent).toMatch(/sign in/i);
  });

  it("starts at sign-in when the stored session has expired", async () => {
    // The SDK checks expiry inside its own `__fetch`, so presence of the key is
    // not enough: starting on `account` would fire a request that clears the
    // session and comes back 401.
    const api = fakeApi();
    api.storage.setItem(API.SESSION, expiredSession());
    render(api);
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/sign in/i);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("returns to sign-in when the API says the customer is not authenticated", async () => {
    const onEvent = vi.fn();
    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({}),
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api, { onEvent });
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/sign in/i);
    // The stale session is dropped, or the next mount routes straight back to
    // an account screen that cannot load.
    expect(api.storage.getItem(API.SESSION)).toBeNull();
    // Nobody signed out, so no `signout` event.
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("does not dead-end on the retry loop when the session is gone", async () => {
    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: false,
        status: 403,
        json: async () => ({}),
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api);
    await flush();
    await flush();

    expect(screen!.host.textContent).not.toMatch(/couldn't load your account/i);
  });

  it("shows a failure state on the sign-out button when signing out fails", async () => {
    const api = fakeApi({
      signOut: vi.fn(async () => {
        throw Object.assign(new Error("nope"), { code: "UNKNOWN" });
      }),
    });
    api.storage.setItem(API.SESSION, session());
    const onEvent = vi.fn();
    render(api, { onEvent });
    await flush();
    await flush();

    clickButtonMatching(/sign out/i);
    await flush();

    // `API.signOut` throws before clearing local state, so the customer is
    // still signed in and must stay on the account screen.
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
    expect(onEvent).not.toHaveBeenCalled();

    const signOut = [...screen!.host.querySelectorAll("button")].find((b) =>
      /sign out/i.test(b.getAttribute("aria-label") ?? ""),
    )!;
    expect(signOut.getAttribute("aria-label")).toMatch(/failed/i);
    expect(signOut.disabled).toBe(false);
  });

  it("does not show one customer's data to the next on the same page load", async () => {
    // The account resource is keyed on the store's base URL, which is the same
    // for every customer, so an un-cleared cache serves the first customer's
    // name, email and tax ID — and their `self` link — to the second.
    const bob = {
      first_name: "Bob",
      last_name: "Kahn",
      email: "bob@example.com",
      tax_id: "",
      _links: {
        self: {
          href: "/c-bob",
          patch: vi.fn(async () => ({ ok: true, status: 200 })),
        },
      },
    };

    let current = ada;
    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => current,
      })),
    });

    render(api);
    await flush();

    submitSignIn("ada@example.com", "hunter2");
    await flush();
    await flush();
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);

    clickButtonMatching(/sign out/i);
    await flush();
    await flush();
    expect(screen!.host.textContent).toMatch(/sign in/i);

    current = bob;
    submitSignIn("bob@example.com", "hunter3");
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Bob Kahn/);
    expect(screen!.host.textContent).not.toMatch(/Ada Lovelace/);
    expect(screen!.host.textContent).not.toMatch(/ada@example\.com/);
  });

  it("fires no signin when sign-up leaves the password blank", async () => {
    // `signUp` stores no session, so there is nothing to sign in with here. The
    // event has to stay unfired at the element boundary, not just at the
    // screen's callback — this is the wiring in `afterSignIn` that decides it.
    settingsResponse = {
      sign_up: {
        enabled: true,
        verification: { type: "hcaptcha", site_key: "key" },
      },
    };

    const signIn = vi.fn(async () => {});
    const signUp = vi.fn(async () => {});
    const onEvent = vi.fn();
    render(fakeApi({ signIn, signUp }), { onEvent });
    await flush();
    await flush();

    clickButtonMatching(/create an account/i);
    await flush();

    const host = screen!.host;
    const email = host.querySelector<HTMLInputElement>('input[type="email"]')!;
    act(() => setInputValue(email, "ada@example.com"));
    act(() => solveCaptcha!("captcha-token"));

    act(() => {
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();
    await flush();

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        password: undefined,
      }),
    );
    expect(signIn).not.toHaveBeenCalled();
    expect(onEvent).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/check your email/i);
  });

  it("fires signin when sign-up supplies a password", async () => {
    settingsResponse = {
      sign_up: {
        enabled: true,
        verification: { type: "hcaptcha", site_key: "key" },
      },
    };

    const signUp = vi.fn(async () => {});
    const onEvent = vi.fn();
    render(fakeApi({ signUp }), { onEvent });
    await flush();
    await flush();

    clickButtonMatching(/create an account/i);
    await flush();

    const host = screen!.host;
    const email = host.querySelector<HTMLInputElement>('input[type="email"]')!;
    const password = host.querySelector<HTMLInputElement>(
      'input[type="password"]',
    )!;
    act(() => {
      setInputValue(email, "ada@example.com");
      setInputValue(password, "hunter2");
    });
    act(() => solveCaptcha!("captcha-token"));

    act(() => {
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();
    await flush();

    expect(onEvent.mock.calls[0]).toEqual(["signin"]);
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
  });

  it("requests portal settings from inside the customer base path", async () => {
    render(fakeApi());
    await flush();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://demo.foxycart.com/s/customer/customer_portal_settings",
    );
  });
});
