import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "@foxy.io/design-system/theme";
import enUsMessages from "@/locales/en-US.json";
import { ApiProvider, RequestCache } from "@/lib/customer-api";
import { setInputValue } from "../test-utils";
import { SignInScreen } from "./sign-in";

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise. Mounting the screen renders React.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function render(
  api: unknown,
  props: Partial<React.ComponentProps<typeof SignInScreen>> = {},
) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);

  act(() =>
    root!.render(
      <ThemeProvider theme={{ tokens: defaultTheme }}>
        <IntlProvider
          locale="en-US"
          messages={enUsMessages as Record<string, string>}
        >
          <ApiProvider api={api as never} cache={new RequestCache()}>
            <SignInScreen
              onSignedIn={props.onSignedIn ?? vi.fn()}
              onRecoverAccess={props.onRecoverAccess ?? vi.fn()}
              onSignUp={props.onSignUp ?? vi.fn()}
              canSignUp={props.canSignUp ?? false}
            />
          </ApiProvider>
        </IntlProvider>
      </ThemeProvider>,
    ),
  );
}

function submit(email: string, password: string) {
  const emailInput = host!.querySelector<HTMLInputElement>(
    'input[type="email"]',
  )!;
  const passwordInput = host!.querySelector<HTMLInputElement>(
    'input[type="password"]',
  )!;

  act(() => {
    setInputValue(emailInput, email);
    setInputValue(passwordInput, password);
  });

  act(() => {
    host!
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
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

    expect(host!.textContent).toMatch(/wrong email or password/i);
  });

  it("hides the create-account link unless sign-up is enabled", () => {
    render({ signIn: async () => {} }, { canSignUp: false });
    expect(host!.textContent).not.toMatch(/create an account/i);
  });

  it("shows the create-account link when sign-up is enabled", () => {
    render({ signIn: async () => {} }, { canSignUp: true });
    expect(host!.textContent).toMatch(/create an account/i);
  });
});
