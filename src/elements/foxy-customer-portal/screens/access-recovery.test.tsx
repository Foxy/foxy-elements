import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { AccessRecoveryScreen } from "./access-recovery";

let screen: MountedScreen | null = null;

function render(api: unknown, onBack = vi.fn()) {
  screen = mountScreen(<AccessRecoveryScreen onBack={onBack} />, api);
}

function submit(email: string) {
  const host = screen!.host;
  const input = host.querySelector<HTMLInputElement>('input[type="email"]')!;

  act(() => setInputValue(input, email));

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

describe("AccessRecoveryScreen", () => {
  it("sends the reset email", async () => {
    const sendPasswordResetEmail = vi.fn(async () => {});
    render({ sendPasswordResetEmail });

    submit("ada@example.com");
    await flush();

    expect(sendPasswordResetEmail).toHaveBeenCalledWith({
      email: "ada@example.com",
    });
  });

  it("confirms without revealing whether the account exists", async () => {
    render({ sendPasswordResetEmail: async () => {} });

    submit("ada@example.com");
    await flush();

    expect(screen!.host.textContent).toMatch(/on its way/i);
    expect(screen!.host.querySelector("form")).toBeNull();
  });

  it("shows a generic error when the request fails", async () => {
    render({
      sendPasswordResetEmail: async () => {
        throw Object.assign(new Error("nope"), { code: "UNKNOWN" });
      },
    });

    submit("ada@example.com");
    await flush();

    expect(screen!.host.textContent).toMatch(/something went wrong/i);
  });

  it("calls onBack from the back link", () => {
    const onBack = vi.fn();
    render({ sendPasswordResetEmail: async () => {} }, onBack);

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons
        .find((b) => /back to sign in/i.test(b.textContent ?? ""))!
        .click();
    });

    expect(onBack).toHaveBeenCalled();
  });
});
