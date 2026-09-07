import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { API } from "@foxy.io/sdk/customer";
import { RequestCache, serialiseQuery } from "@/lib/customer-api";
import { mountScreen, setInputValue, type MountedScreen } from "./test-utils";
import { resetHCaptchaLoaderForTests } from "./hcaptcha";
import { Portal } from "./view";
import { PortalContainerContext } from "./portal-container";

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
      urlSync={(props.urlSync as boolean) ?? false}
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

  it("shows the customer's updated name after a profile save", async () => {
    // `ProfilePage` calls `cache.clear()` then `onBack()` on a successful save
    // (replacing the old dialog's `onSaved` callback -- see the plan's Global
    // Constraints) instead of the screen re-fetching directly. This proves
    // that end to end: `AccountScreen`'s `useResource` has to notice the
    // cleared cache entry and re-read, not keep showing the pre-save name.
    let current = ada;
    const patch = vi.fn(async (body: Record<string, unknown>) => {
      current = { ...current, ...body };
      return { ok: true, status: 200 };
    });
    current = { ...ada, _links: { self: { href: "/c", patch } } } as never;

    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => current,
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api);
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);

    clickButtonMatching(/edit profile/i);
    await flush();

    const first = document.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;
    act(() => setInputValue(first, "Augusta"));

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Augusta Lovelace/);
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
    // ProfilePage renders inline now, not through a portal, but a flush is
    // still needed for the async patch below to settle.
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

  it("returns to the previous scroll position when Back is pressed", async () => {
    // A customer who opened an address from the bottom of a long list should
    // come back to that address, not to the top of the list they now have to
    // scroll through again.
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const container = document.createElement("div");
    container.scrollIntoView = vi.fn();

    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());

    try {
      screen = mountScreen(
        <PortalContainerContext value={container}>
          <Portal
            api={api as never}
            cache={new RequestCache()}
            fullNameTemplate="{first_name} {last_name}"
            skipPasswordReset={false}
            urlSync={false}
            onEvent={vi.fn()}
          />
        </PortalContainerContext>,
        api,
      );
      await flush();
      await flush();

      // Stand somewhere down the home page, then open a sub-page.
      Object.defineProperty(window, "scrollY", {
        value: 1868,
        configurable: true,
      });

      clickButtonMatching(/edit profile/i);
      await flush();

      // Forward: opens at its own top, not at home's offset.
      expect(container.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollTo).not.toHaveBeenCalled();

      act(() => {
        const buttons = [...screen!.host.querySelectorAll("button")];
        buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
      });
      await flush();

      // Back: the exact offset the customer left from.
      expect(scrollTo).toHaveBeenCalledWith(0, 1868);
      expect(container.scrollIntoView).toHaveBeenCalledTimes(1);
    } finally {
      scrollTo.mockRestore();
    }
  });

  it("opens a forward navigation at the top even for a page seen before", async () => {
    // The flag is set by the Back control, never inferred from the target
    // page -- home is both what Back returns to and where several forward
    // links go, so inferring would restore a scroll position on a link the
    // customer expects to open at the top.
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const container = document.createElement("div");
    container.scrollIntoView = vi.fn();

    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());

    try {
      screen = mountScreen(
        <PortalContainerContext value={container}>
          <Portal
            api={api as never}
            cache={new RequestCache()}
            fullNameTemplate="{first_name} {last_name}"
            skipPasswordReset={false}
            urlSync={false}
            onEvent={vi.fn()}
          />
        </PortalContainerContext>,
        api,
      );
      await flush();
      await flush();

      Object.defineProperty(window, "scrollY", {
        value: 900,
        configurable: true,
      });

      // Visit, come back (which records a position for the profile page),
      // then go forward to the same page again.
      clickButtonMatching(/edit profile/i);
      await flush();
      act(() => {
        const buttons = [...screen!.host.querySelectorAll("button")];
        buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
      });
      await flush();

      scrollTo.mockClear();
      (container.scrollIntoView as ReturnType<typeof vi.fn>).mockClear();

      clickButtonMatching(/edit profile/i);
      await flush();

      expect(container.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollTo).not.toHaveBeenCalled();
    } finally {
      scrollTo.mockRestore();
    }
  });

  it("brings the portal's top into view on a forward navigation", async () => {
    // Swapping pages leaves the document's scroll offset alone, so opening a
    // short page from far down a long one lands the customer at its end -- on
    // mobile, tapping Edit at the bottom of Home opened the address form
    // scrolled past everything in it.
    const scrollIntoView = vi.fn();
    const container = document.createElement("div");
    container.scrollIntoView = scrollIntoView;

    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());

    screen = mountScreen(
      <PortalContainerContext value={container}>
        <Portal
          api={api as never}
          cache={new RequestCache()}
          fullNameTemplate="{first_name} {last_name}"
          skipPasswordReset={false}
          urlSync={false}
          onEvent={vi.fn()}
        />
      </PortalContainerContext>,
      api,
    );
    await flush();
    await flush();

    expect(scrollIntoView).not.toHaveBeenCalled();

    clickButtonMatching(/edit profile/i);
    await flush();

    // The element's own container, not the window: the portal is embedded in
    // someone else's page, which may have content above it, and scrolling
    // that page to zero would discard a position the widget does not own.
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("restores scroll on browser Back the same way the in-portal Back does", async () => {
    // Both Backs read the same map, so they cannot disagree. The browser's
    // own restoration cannot do this job here: it fires as the entry is
    // popped, before React has rendered the taller page, so the offset clamps
    // to the height of the page being left.
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const container = document.createElement("div");
    container.scrollIntoView = vi.fn();

    const api = fakeApi();
    api.storage.setItem(API.SESSION, session());
    const originalUrl = window.location.href;
    const originalRestoration = history.scrollRestoration;

    try {
      screen = mountScreen(
        <PortalContainerContext value={container}>
          <Portal
            api={api as never}
            cache={new RequestCache()}
            fullNameTemplate="{first_name} {last_name}"
            skipPasswordReset={false}
            urlSync
            onEvent={vi.fn()}
          />
        </PortalContainerContext>,
        api,
      );
      await flush();
      await flush();

      // While the portal owns history entries it takes scroll restoration
      // off the browser -- otherwise both would fire and the browser's
      // clamped value could win.
      expect(history.scrollRestoration).toBe("manual");

      Object.defineProperty(window, "scrollY", {
        value: 1420,
        configurable: true,
      });

      clickButtonMatching(/edit profile/i);
      await flush();

      scrollTo.mockClear();

      history.pushState({}, "", originalUrl);
      act(() => {
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      await flush();

      expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
      expect(scrollTo).toHaveBeenCalledWith(0, 1420);
    } finally {
      scrollTo.mockRestore();
      history.replaceState({}, "", originalUrl);
      history.scrollRestoration = originalRestoration;
    }
  });

  it("hands scroll restoration back when it stops owning history", async () => {
    // A document-global setting, and this element is a guest on someone
    // else's page: leaving it on "manual" after unmount would silently break
    // the host's own Back behaviour.
    const originalRestoration = history.scrollRestoration;
    const originalUrl = window.location.href;

    try {
      const api = fakeApi();
      api.storage.setItem(API.SESSION, session());

      render(api, { urlSync: true });
      await flush();
      await flush();

      expect(history.scrollRestoration).toBe("manual");

      screen!.unmount();
      screen = null;

      expect(history.scrollRestoration).toBe(originalRestoration);
    } finally {
      history.replaceState({}, "", originalUrl);
      history.scrollRestoration = originalRestoration;
    }
  });

  it("keeps the URL in sync when urlSync is enabled: pushes on navigate, routes back on popstate, and clears on sign-out", async () => {
    // Task 3's actual deliverable -- `navigateAccountPage`/`resetAccountPage`/
    // the `popstate` listener in `view.tsx` -- has no other test exercising it
    // end to end; every other test in this file renders with the default
    // `urlSync: false`. Runs in the suite's real Chromium page, so the
    // original URL is restored in `finally` rather than leaking into later
    // tests. Assertions read `fc_page`/`fc_id` off `URLSearchParams` rather
    // than comparing the whole `search` string: the suite's real Chromium
    // page already carries its own runner params (`sessionId`, `iframeId`)
    // that this element must not disturb -- see the "preserves the host
    // page's own query params" test below, which pins that down directly.
    const originalUrl = window.location.href;

    try {
      const api = fakeApi();
      api.storage.setItem(API.SESSION, session());
      render(api, { urlSync: true });
      await flush();
      await flush();

      clickButtonMatching(/edit profile/i);
      await flush();

      expect(new URLSearchParams(window.location.search).get("fc_page")).toBe(
        "profile",
      );

      // Simulate the browser's Back button landing on the pre-portal URL --
      // no `fc_page` at all -- which `parseAccountPageFromSearch`'s fallback
      // must read as home, not crash or stay on the profile page.
      history.pushState({}, "", originalUrl);
      act(() => {
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
      await flush();

      expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
      expect(window.location.search).not.toMatch(/fc_page/);

      // Sign-out goes through `resetAccountPage` (`replaceState`, not
      // `pushState`) so a stale sub-page query never survives into the next
      // session on a shared computer.
      clickButtonMatching(/edit profile/i);
      await flush();
      expect(new URLSearchParams(window.location.search).get("fc_page")).toBe(
        "profile",
      );

      act(() => {
        const buttons = [...screen!.host.querySelectorAll("button")];
        buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
      });
      await flush();

      clickButtonMatching(/sign out/i);
      await flush();

      expect(screen!.host.textContent).toMatch(/sign in/i);
      expect(window.location.search).not.toMatch(/fc_page|fc_id/);
    } finally {
      history.replaceState({}, "", originalUrl);
    }
  });

  it("keeps a deep-linked page after signing in while urlSync is on", async () => {
    // Guards the Finding 1 fix against a regression in the opposite
    // direction: `PortalScreens`'s reset effect must only fire on an
    // `account`/`password-reset` -> `sign-in` transition, never on the
    // ordinary `sign-in` -> `account` transition a deep link relies on (see
    // `Portal`'s own comment on why `accountPage` and `screen` are separate
    // state -- a page queued while signed out has to survive `afterSignIn`
    // flipping `screen`).
    const originalUrl = window.location.href;

    try {
      const seededUrl = new URL(window.location.href);
      seededUrl.searchParams.set("fc_page", "profile");
      history.replaceState({}, "", seededUrl);

      render(fakeApi(), { urlSync: true }); // no session -- starts at sign-in
      await flush();

      submitSignIn();
      await flush();
      await flush();

      expect(screen!.host.textContent).toMatch(/edit profile/i);
    } finally {
      history.replaceState({}, "", originalUrl);
    }
  });

  it("preserves the host page's own query params when urlSync writes fc_page/fc_id", async () => {
    // Finding 2 of the whole-branch review: `navigateAccountPage` used to do
    // `url.search = accountPageToSearchParams(page).toString()`, which
    // replaces the ENTIRE query string -- destroying any params unrelated to
    // this element (`?utm_source=nl` on a real host page would vanish). The
    // spec's own stated reason for the `fc_` prefix is that the host page may
    // have other params of its own; that prefix is pointless if the whole
    // string gets overwritten anyway. Same URL save/restore pattern as the
    // urlSync test above.
    const originalUrl = window.location.href;

    try {
      // Adds to the current URL's params rather than replacing them outright
      // -- the suite's real Chromium page already carries its own runner
      // params (`sessionId`, `iframeId`), and stomping those here would be
      // exactly the bug this test exists to catch, just done by the test
      // itself instead of by `view.tsx`.
      const seededUrl = new URL(window.location.href);
      seededUrl.searchParams.set("utm_source", "nl");
      history.replaceState({}, "", seededUrl);

      const api = fakeApi();
      api.storage.setItem(API.SESSION, session());
      render(api, { urlSync: true });
      await flush();
      await flush();

      clickButtonMatching(/edit profile/i);
      await flush();

      const params = new URLSearchParams(window.location.search);
      expect(params.get("utm_source")).toBe("nl");
      expect(params.get("fc_page")).toBe("profile");
    } finally {
      history.replaceState({}, "", originalUrl);
    }
  });

  it("does not show one customer's carried resource to the next customer after a forced sign-out (401)", async () => {
    // Finding 1 of the whole-branch review (Critical): `accountPage` state
    // can carry a `resource` field (a full address/order/subscription
    // object). The explicit sign-out path already resets it via
    // `onResetAccountPage()`, but a 401/403 routed through
    // `handleUnauthenticated` used to leave it standing -- unlike
    // `cache.clear()`, which the effect above already ran on both paths. This
    // drives the reset through the 401 path specifically (not sign-out),
    // carrying a `resource` into `accountPage` first, then signs in a second
    // customer and asserts the first customer's data is gone.
    const adaAddress = {
      address_name: "Ada Home",
      first_name: "Ada",
      last_name: "Lovelace",
      company: "",
      phone: "",
      address1: "1 Main Street",
      address2: "",
      city: "London",
      region: "",
      postal_code: "SW1A 1AA",
      country: "GB",
      is_default_billing: false,
      is_default_shipping: false,
      date_created: new Date().toISOString(),
      date_modified: new Date().toISOString(),
      _links: {
        self: {
          href: "/addresses/1",
          patch: vi.fn(async () => ({ ok: false, status: 401 })),
        },
      },
    };

    const adaWithAddress = {
      ...ada,
      _links: {
        ...ada._links,
        "fx:customer_addresses": {
          href: "https://demo.foxycart.com/s/customer/addresses",
          get: async () => ({
            ok: true,
            status: 200,
            json: async () => ({
              total_items: 1,
              _embedded: { "fx:addresses": [adaAddress] },
            }),
          }),
        },
      },
    };

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

    let current: unknown = adaWithAddress;
    const api = fakeApi({
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => current,
      })),
    });
    api.storage.setItem(API.SESSION, session());
    render(api);
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);

    // Navigate into the address's Edit page -- this is what attaches
    // `adaAddress` to `accountPage.resource`.
    clickButtonMatching(/^edit$/i);
    await flush();

    const line1BeforeSignOut = document.querySelector<HTMLInputElement>(
      'input[autocomplete="address-line1"]',
    );
    expect(line1BeforeSignOut?.value).toBe("1 Main Street");

    // Force a 401 through a write on this page (not an explicit sign-out) --
    // this is the `handleUnauthenticated` path Finding 1 is about.
    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(screen!.host.textContent).toMatch(/sign in/i);

    // Sign in as a different customer, Bob.
    current = bob;
    submitSignIn("bob@example.com", "hunter3");
    await flush();
    await flush();

    expect(screen!.host.textContent).toMatch(/Bob Kahn/);
    // The stale "Edit address" page (Ada's) must not still be showing.
    expect(screen!.host.textContent).not.toMatch(/edit address/i);
    const line1AfterSignIn = document.querySelector<HTMLInputElement>(
      'input[autocomplete="address-line1"]',
    );
    expect(line1AfterSignIn).toBeNull();
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
  // that same object to `SubscriptionsSection` -> the subscription page
  // rather than fetching it again. A customer local to this test (not the
  // shared `ada`, which ~15 other tests here reuse) carries one subscription
  // so the account screen actually mounts the section.
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

  it("carries the settings response down to the subscription page", async () => {
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
    //
    // Matched on the rendered label, not the wire value: the Select shows
    // "Yearly" while keeping "1y" as the option's value. The rule that had
    // to survive the trip down is still the one carrying "1y".
    expect(options.join(" ")).toMatch(/Yearly/);
  });
});
