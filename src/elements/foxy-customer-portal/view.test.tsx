import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { API } from "@foxy.io/sdk/customer";
import { mountScreen, setInputValue, type MountedScreen } from "./test-utils";
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

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

const ada = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "",
  _links: { self: { href: "/c", patch: vi.fn(async () => ({})) } },
};

// A minimal double of `@foxy.io/sdk/customer`'s `API`: `storage` is a real
// Map-backed Storage so `API.SESSION` round-trips exactly like production,
// and every method the router or a routed screen touches is stubbed.
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
    signIn: vi.fn(async () => {}),
    signOut: vi.fn(async () => {
      store.delete(API.SESSION);
    }),
    sendPasswordResetEmail: vi.fn(async () => {}),
    get: vi.fn(async () => ({ json: async () => ada })),
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
    api.storage.setItem(API.SESSION, "token");
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
    api.storage.setItem(API.SESSION, "token");
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

  it("requests portal settings from outside the customer graph", async () => {
    render(fakeApi());
    await flush();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://demo.foxycart.com/s/customer_portal_settings",
    );
  });
});
