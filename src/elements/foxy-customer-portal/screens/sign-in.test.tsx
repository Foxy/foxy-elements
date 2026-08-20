import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { SignInScreen } from "./sign-in";

let screen: MountedScreen | null = null;

function render(
  api: unknown,
  props: Partial<React.ComponentProps<typeof SignInScreen>> = {},
) {
  screen = mountScreen(
    <SignInScreen
      onSignedIn={props.onSignedIn ?? vi.fn()}
      onRecoverAccess={props.onRecoverAccess ?? vi.fn()}
      onSignUp={props.onSignUp ?? vi.fn()}
      canSignUp={props.canSignUp ?? false}
    />,
    api,
  );
}

function submit(email: string, password: string) {
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

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

afterEach(() => {
  screen?.unmount();
  screen = null;
});

describe("SignInScreen", () => {
  it("calls signIn with the entered credentials", async () => {
    const signIn = vi.fn(async () => {});
    render({ signIn });

    submit("ada@example.com", "hunter2");
    await flush();

    expect(signIn).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "hunter2",
    });
  });

  it("notifies the parent after a successful sign-in", async () => {
    const onSignedIn = vi.fn();
    render({ signIn: async () => {} }, { onSignedIn });

    submit("ada@example.com", "hunter2");
    await flush();

    expect(onSignedIn).toHaveBeenCalled();
  });

  it("shows a credentials error on UNAUTHORIZED", async () => {
    render({
      signIn: async () => {
        throw Object.assign(new Error("nope"), { code: "UNAUTHORIZED" });
      },
    });

    submit("ada@example.com", "wrong");
    await flush();

    expect(screen!.host.textContent).toMatch(/wrong email or password/i);
  });

  it("hides the create-account link unless sign-up is enabled", () => {
    render({ signIn: async () => {} }, { canSignUp: false });
    expect(screen!.host.textContent).not.toMatch(/create an account/i);
  });

  it("shows the create-account link when sign-up is enabled", () => {
    render({ signIn: async () => {} }, { canSignUp: true });
    expect(screen!.host.textContent).toMatch(/create an account/i);
  });
});
