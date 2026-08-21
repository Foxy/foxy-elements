import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { API } from "@foxy.io/sdk/customer";
import { RequestCache, serialiseQuery } from "@/lib/customer-api";
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
  subscriptions?: {
    allow_frequency_modification: unknown;
    allow_next_date_modification: unknown;
  };
  cart_display_config?: {
    show_sub_frequency?: boolean;
    show_sub_startdate?: boolean;
    show_sub_nextdate?: boolean;
    show_sub_enddate?: boolean;
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
      api={api as never}
      cache={(props.cache as RequestCache) ?? new RequestCache()}
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

  it("does not route to sign-in when the public settings read comes back unauthorized", async () => {
    // `customer_portal_settings` (fetched by `view.tsx`'s `useSettingsLink`)
    // is public and unrelated to the customer's session -- a misconfigured
    // store, WAF or proxy answering it 401/403 says nothing about whether
    // the customer is still signed in. This read also runs on every screen,
    // so routing on it here would be far more disruptive than on any one
    // customer-scoped resource.
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    });
    const onEvent = vi.fn();
    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());
    render(api, { onEvent });
    await flush();
    await flush();

    expect(screen!.host.textContent).not.toMatch(/sign in/i);
    expect(screen!.host.textContent).toMatch(ada.first_name);
    expect(api.storage.getItem(API.SESSION)).not.toBeNull();
  });

  it("routes to sign-in when a write comes back unauthorized", async () => {
    // Mirrors the read-side test above, but through the profile dialog's save
    // instead of the initial account load — this is the wiring
    // `ApiProvider`'s `onUnauthenticated` exists for.
    //
    // Routing alone doesn't prove the cache got cleared, which is the actual
    // PII guard (see the doc comment above the effect in view.tsx): the
    // account resource is keyed on the store's base URL, the same for every
    // customer, so a stale entry would still hand the next customer Ada's
    // name, email and `self` link. A swap-to-a-second-customer assertion
    // can't pin that down here: `afterSignIn` clears the cache unconditionally
    // on every sign-in, so it would mask a missing clear on this path in any
    // test that goes on to sign someone else in. So this probes the cache
    // directly, before anyone signs back in.
    const onEvent = vi.fn();
    const patch = vi.fn(async () => ({ ok: false, status: 401 }));
    const customer = { ...ada, _links: { self: { href: "/c", patch } } };
    const cache = new RequestCache();
    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => customer,
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api, { onEvent, cache });
    await flush();
    await flush();

    clickButtonMatching(/edit profile/i);
    // The dialog portals into `document.body`, not `screen.host` — see
    // `profile-dialog.test.tsx` — and needs a flush before Base UI finishes
    // opening it.
    await flush();

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(screen!.host.textContent).toMatch(/sign in/i);
    expect(api.storage.getItem(API.SESSION)).toBeNull();
    // The customer did not sign out, so no `signout` event either.
    expect(onEvent).not.toHaveBeenCalled();

    // The account resource's cache key: `AccountScreen`'s `rootLink` uses
    // `api.base.toString()` as `href` and `useResource` calls it with no
    // query. A lingering entry here returns Ada's data synchronously and
    // never touches `probe`; a cleared cache returns the empty entry and
    // starts loading through `probe` instead.
    const accountKey = `${api.base.toString()}|${serialiseQuery(undefined)}`;
    const probe = vi.fn(async () => "probe");
    const probedEntry = cache.read(accountKey, probe);

    expect(probedEntry.data).toBeNull();
    expect(probe).toHaveBeenCalled();

    await flush();
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

  // FX-275's mount point: `PortalScreens` already fetches
  // `customer_portal_settings` for sign-up gating, and `account.tsx` forwards
  // that same object to `SubscriptionsSection` -> `ManageDialog` rather than
  // fetching it again. A customer local to this test (not the shared `ada`,
  // which ~15 other tests here reuse) carries one subscription so the account
  // screen actually mounts the section.
  // `account.tsx` used to gate `cart_display_config` behind the same check
  // that derives `subscriptionsSettings` from `settings.subscriptions` --
  // so a settings payload that carries `cart_display_config` but happens to
  // omit `subscriptions` (both are independent keys on the same resource)
  // would silently ignore the store's display flags. The two must be threaded
  // independently.
  it("honours cart_display_config even when the settings payload has no subscriptions key", async () => {
    settingsResponse = {
      sign_up: {
        enabled: false,
        verification: { type: "hcaptcha", site_key: "" },
      },
      // Deliberately no `subscriptions` key.
      cart_display_config: { show_sub_nextdate: false },
    };

    const customerWithSubscription = {
      ...ada,
      _links: {
        ...ada._links,
        "fx:subscriptions": {
          href: "https://demo.foxycart.com/s/customer/subscriptions",
          get: async () => ({
            ok: true,
            status: 200,
            json: async () => ({
              total_items: 1,
              _embedded: {
                "fx:subscriptions": [
                  {
                    frequency: "1m",
                    start_date: "2020-01-01T00:00:00Z",
                    next_transaction_date: "2099-01-01T00:00:00Z",
                    end_date: null,
                    is_active: true,
                    error_message: "",
                    first_failed_transaction_date: null,
                    _links: {
                      self: {
                        href: "https://demo.foxycart.com/s/customer/subscriptions/1",
                      },
                    },
                    _embedded: {
                      "fx:transaction_template": {
                        currency_code: "USD",
                        total_order: 10,
                        _embedded: {
                          "fx:items": [{ name: "Coffee", quantity: 1 }],
                        },
                      },
                    },
                  },
                ],
              },
            }),
          }),
        },
      },
    };

    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => customerWithSubscription,
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api);
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Coffee/);
    expect(screen!.host.textContent).not.toMatch(/next payment/i);
  });

  it("carries the settings response down to the subscription manage dialog", async () => {
    settingsResponse = {
      sign_up: {
        enabled: false,
        verification: { type: "hcaptcha", site_key: "" },
      },
      subscriptions: {
        allow_frequency_modification: [
          { jsonata_query: "*", values: ["1m", "2m", "1y"] },
        ],
        allow_next_date_modification: true,
      },
    };

    const customerWithSubscription = {
      ...ada,
      _links: {
        ...ada._links,
        "fx:subscriptions": {
          href: "https://demo.foxycart.com/s/customer/subscriptions",
          get: async () => ({
            ok: true,
            status: 200,
            json: async () => ({
              total_items: 1,
              _embedded: {
                "fx:subscriptions": [
                  {
                    frequency: "1m",
                    start_date: "2020-01-01T00:00:00Z",
                    next_transaction_date: "2099-01-01T00:00:00Z",
                    end_date: null,
                    is_active: true,
                    error_message: "",
                    first_failed_transaction_date: null,
                    _links: {
                      self: {
                        href: "https://demo.foxycart.com/s/customer/subscriptions/1",
                      },
                    },
                    _embedded: {
                      "fx:transaction_template": {
                        currency_code: "USD",
                        total_order: 10,
                        _embedded: {
                          "fx:items": [{ name: "Coffee", quantity: 1 }],
                        },
                      },
                    },
                  },
                ],
              },
            }),
          }),
        },
      },
    };

    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => customerWithSubscription,
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api);
    await flush();
    await flush();

    clickButtonMatching(/manage/i);
    await flush();

    // Base UI renders a `Select`'s options only once its popup is open, so
    // asserting against a closed one would pass whether or not the frequency
    // rule ever arrived.
    act(() => {
      document
        .querySelector<HTMLElement>(
          '[role="combobox"], [aria-haspopup="listbox"]',
        )
        ?.click();
    });

    const options = [...document.querySelectorAll('[role="option"]')].map(
      (option) => option.textContent,
    );

    // If `account.tsx` dropped `settings` on the way to `SubscriptionsSection`,
    // `getAllowedFrequencies` would see no rule, `frequencies` would be `[]`,
    // and the Select would never render at all — this list would be empty.
    expect(options.join(" ")).toMatch(/1y/);
  });
});
