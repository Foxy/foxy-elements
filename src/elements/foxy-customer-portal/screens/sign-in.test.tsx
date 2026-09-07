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
  it("frames the form the way the rest of the portal is framed", () => {
    // These screens had no chrome at all: a bare `<form>` with a
    // browser-default `<h1>`, no padding and no page background, rendering
    // flush against whatever embedded them while every signed-in screen sat
    // in a framed container.
    render({ signIn: async () => {} });

    const container = screen!.host.firstElementChild as HTMLElement;
    const containerStyles = getComputedStyle(container);

    expect(containerStyles.boxSizing).toBe("border-box");
    expect(parseFloat(containerStyles.paddingTop)).toBeGreaterThanOrEqual(40);

    // `<h1>` at font.h1 (28px), matching the home screen's customer name and
    // every account sub-page. A bare `<h1>` takes the host page's font.
    const heading = screen!.host.querySelector("h1");
    expect(heading).not.toBeNull();
    expect(getComputedStyle(heading!).fontSize).toBe("28px");
  });

  it("caps and centres the form rather than letting it fill the page", () => {
    render({ signIn: async () => {} });

    const column = screen!.host.querySelector("h1")!.parentElement!;
    screen!.host.style.width = "1200px";

    const styles = getComputedStyle(column);
    expect(styles.maxWidth).toBe("420px");
    expect(parseFloat(styles.rowGap)).toBeGreaterThanOrEqual(12);

    // Measured, not just declared: centred means equal space either side.
    const columnBox = column.getBoundingClientRect();
    const hostBox = screen!.host.getBoundingClientRect();
    const left = columnBox.left - hostBox.left;
    const right = hostBox.right - columnBox.right;

    expect(Math.round(columnBox.width)).toBe(420);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  });

  it("separates the ways out of signing in from signing in", () => {
    // "Forgot password?" and "Create an account" were siblings of the
    // password field, in the same undifferentiated stack as the submit
    // button they are alternatives to.
    render({ signIn: async () => {} }, { canSignUp: true });

    const recover = [...screen!.host.querySelectorAll("button")].find((b) =>
      /forgot|recover/i.test(b.textContent ?? ""),
    )!;
    const submit = screen!.host.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )!;

    const group = recover.parentElement!;
    expect(group.contains(submit)).toBe(false);
    expect(getComputedStyle(group).borderTopStyle).toBe("solid");

    // The primary action spans the column; a left-aligned submit under
    // full-width inputs and above centred links reads as a stray element.
    const column = screen!.host.querySelector("h1")!.parentElement!;
    expect(Math.round(submit.getBoundingClientRect().width)).toBe(
      Math.round(column.getBoundingClientRect().width),
    );
  });

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

  it("blocks submit and shows a message when email is blank", () => {
    const signIn = vi.fn(async () => {});
    render({ signIn });

    submit("", "hunter2");

    expect(signIn).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/required/i);
  });

  it("blocks submit and shows a message for a malformed email", () => {
    const signIn = vi.fn(async () => {});
    render({ signIn });

    submit("not-an-email", "hunter2");

    expect(signIn).not.toHaveBeenCalled();
    expect(screen!.host.textContent).toMatch(/valid email/i);
  });
});
