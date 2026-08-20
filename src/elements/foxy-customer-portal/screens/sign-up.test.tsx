import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { resetHCaptchaLoaderForTests } from "../hcaptcha";
import { SignUpScreen } from "./sign-up";

let screen: MountedScreen | null = null;
let solve: ((token: string) => void) | null = null;
let renderedInto: HTMLElement | null = null;
let resetWidget = vi.fn();

beforeEach(() => {
  resetHCaptchaLoaderForTests();
  resetWidget = vi.fn();
  (window as { hcaptcha?: unknown }).hcaptcha = {
    render: (
      container: HTMLElement,
      options: { callback(token: string): void },
    ) => {
      renderedInto = container;
      solve = options.callback;
      return "widget-1";
    },
    reset: resetWidget,
  };
});

afterEach(() => {
  screen?.unmount();
  screen = null;
  delete (window as { hcaptcha?: unknown }).hcaptcha;
  solve = null;
  renderedInto = null;
});

function render(api: unknown, onSignedIn = vi.fn()) {
  screen = mountScreen(
    <SignUpScreen
      siteKey="site-key"
      onSignedIn={onSignedIn}
      onBack={vi.fn()}
    />,
    api,
  );
}

function fill() {
  const host = screen!.host;
  const email = host.querySelector<HTMLInputElement>('input[type="email"]')!;
  const password = host.querySelector<HTMLInputElement>(
    'input[type="password"]',
  )!;

  act(() => {
    setInputValue(email, "ada@example.com");
    setInputValue(password, "hunter2");
  });
}

function submitForm() {
  act(() => {
    screen!.host
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe("SignUpScreen", () => {
  it("refuses to submit before the captcha is solved", async () => {
    const signUp = vi.fn(async () => {});
    render({ signUp, signIn: vi.fn(async () => {}) });
    await flush();

    fill();
    submitForm();
    await flush();

    expect(signUp).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/verification challenge/i);
  });

  it("sends the captcha token with the sign-up request", async () => {
    const signUp = vi.fn(async () => {});
    render({ signUp, signIn: vi.fn(async () => {}) });
    await flush();

    // The widget must render inside this component's DOM, not document.body.
    expect(renderedInto).not.toBeNull();
    expect(screen!.host.contains(renderedInto)).toBe(true);

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        password: "hunter2",
        verification: { type: "hcaptcha", token: "captcha-token" },
      }),
    );
  });

  it("omits the password when the field is left blank", async () => {
    const signUp = vi.fn(async () => {});
    render({ signUp, signIn: vi.fn(async () => {}) });
    await flush();

    const email = screen!.host.querySelector<HTMLInputElement>(
      'input[type="email"]',
    )!;
    act(() => setInputValue(email, "ada@example.com"));

    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        password: undefined,
        verification: { type: "hcaptcha", token: "captcha-token" },
      }),
    );
  });

  it("reports a taken email on UNAVAILABLE", async () => {
    render({
      signIn: vi.fn(async () => {}),
      signUp: async () => {
        throw Object.assign(new Error("taken"), { code: "UNAVAILABLE" });
      },
    });
    await flush();

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(screen!.host.textContent).toMatch(/already registered/i);
  });

  it("resets the widget and clears the token after a failed submit", async () => {
    const signUp = vi.fn(async () => {
      throw Object.assign(new Error("taken"), { code: "UNAVAILABLE" });
    });
    render({ signUp, signIn: vi.fn(async () => {}) });
    await flush();

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(resetWidget).toHaveBeenCalledWith("widget-1");
    expect(screen!.host.textContent).toMatch(/already registered/i);

    // Retrying without solving a fresh challenge must not resend the stale
    // token: the token was cleared, so this submit is blocked exactly like
    // the very first, unsolved one.
    signUp.mockClear();
    submitForm();
    await flush();

    expect(signUp).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/verification challenge/i);
  });

  it("reports an invalid form on INVALID_FORM", async () => {
    render({
      signIn: vi.fn(async () => {}),
      signUp: async () => {
        throw Object.assign(new Error("bad"), { code: "INVALID_FORM" });
      },
    });
    await flush();

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(screen!.host.textContent).toMatch(/check the form/i);
  });

  // `signUp` only POSTs and stores nothing, so registration on its own leaves
  // the customer with no session. These four cover what happens next.

  it("signs in with the supplied password before reporting success", async () => {
    const signUp = vi.fn(async () => {});
    const signIn = vi.fn(async () => {});
    const onSignedIn = vi.fn();
    render({ signUp, signIn }, onSignedIn);
    await flush();

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(signIn).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "hunter2",
    });
    expect(onSignedIn).toHaveBeenCalled();
  });

  it("confirms by email and reports nothing when the password was left blank", async () => {
    const signUp = vi.fn(async () => {});
    const signIn = vi.fn(async () => {});
    const onSignedIn = vi.fn();
    render({ signUp, signIn }, onSignedIn);
    await flush();

    const email = screen!.host.querySelector<HTMLInputElement>(
      'input[type="email"]',
    )!;
    act(() => setInputValue(email, "ada@example.com"));
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(signUp).toHaveBeenCalled();
    // No password to sign in with, so no session, so no success callback —
    // reporting one here would fire the public `signin` event for a customer
    // who is not signed in.
    expect(signIn).not.toHaveBeenCalled();
    expect(onSignedIn).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/check your email/i);
  });

  it("does not sign in when registration failed", async () => {
    const signIn = vi.fn(async () => {});
    const onSignedIn = vi.fn();
    render(
      {
        signIn,
        signUp: async () => {
          throw Object.assign(new Error("taken"), { code: "UNAVAILABLE" });
        },
      },
      onSignedIn,
    );
    await flush();

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(signIn).not.toHaveBeenCalled();
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it("says the account exists but sign-in failed, and keeps the captcha", async () => {
    const onSignedIn = vi.fn();
    render(
      {
        signUp: vi.fn(async () => {}),
        signIn: async () => {
          throw Object.assign(new Error("nope"), { code: "UNAUTHORIZED" });
        },
      },
      onSignedIn,
    );
    await flush();

    fill();
    act(() => solve!("captcha-token"));
    submitForm();
    await flush();

    expect(onSignedIn).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/couldn't sign you in/i);
    // Re-solving the challenge would only invite a duplicate registration.
    expect(resetWidget).not.toHaveBeenCalled();
  });
});
