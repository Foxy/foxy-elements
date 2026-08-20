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

function render(api: unknown, onSignedUp = vi.fn()) {
  screen = mountScreen(
    <SignUpScreen
      siteKey="site-key"
      onSignedUp={onSignedUp}
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
    render({ signUp });
    await flush();

    fill();
    submitForm();
    await flush();

    expect(signUp).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/verification challenge/i);
  });

  it("sends the captcha token with the sign-up request", async () => {
    const signUp = vi.fn(async () => {});
    render({ signUp });
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
    render({ signUp });
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
    render({ signUp });
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
});
