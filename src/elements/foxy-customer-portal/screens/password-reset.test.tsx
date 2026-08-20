import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { PasswordResetScreen } from "./password-reset";

let screen: MountedScreen | null = null;

function render(
  api: unknown,
  props: Partial<React.ComponentProps<typeof PasswordResetScreen>> = {},
) {
  screen = mountScreen(
    <PasswordResetScreen
      onCompleted={props.onCompleted ?? vi.fn()}
      onSkipped={props.onSkipped ?? vi.fn()}
      canSkip={props.canSkip ?? true}
    />,
    api,
  );
}

function fill(next: string, confirm: string) {
  const host = screen!.host;
  const [a, b] = [
    ...host.querySelectorAll<HTMLInputElement>('input[type="password"]'),
  ];

  act(() => {
    setInputValue(a, next);
    setInputValue(b, confirm);
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

function fakeApi(patch = vi.fn(async () => ({}))) {
  return {
    usesTemporaryPassword: true,
    get: async () => ({
      json: async () => ({ _links: { self: { href: "/c", patch } } }),
    }),
  };
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

describe("PasswordResetScreen", () => {
  it("rejects a mismatched confirmation without calling the API", async () => {
    const patch = vi.fn(async () => ({}));
    render(fakeApi(patch));
    await flush();

    fill("hunter2", "hunter3");
    await flush();

    expect(screen!.host.textContent).toMatch(/do not match/i);
    expect(patch).not.toHaveBeenCalled();
  });

  it("patches the customer with the new password", async () => {
    const patch = vi.fn(async () => ({}));
    render(fakeApi(patch));
    await flush();

    fill("hunter2", "hunter2");
    await flush();

    expect(patch).toHaveBeenCalledWith({ password: "hunter2" });
  });

  it("clears usesTemporaryPassword and notifies on success", async () => {
    const api = fakeApi();
    const onCompleted = vi.fn();
    render(api, { onCompleted });
    await flush();

    fill("hunter2", "hunter2");
    await flush();

    expect(api.usesTemporaryPassword).toBe(false);
    expect(onCompleted).toHaveBeenCalled();
  });

  it("hides the skip button when skipping is not allowed", async () => {
    render(fakeApi(), { canSkip: false });
    await flush();

    expect(screen!.host.textContent).not.toMatch(/skip for now/i);
  });

  it("calls onSkipped from the skip button", async () => {
    const onSkipped = vi.fn();
    render(fakeApi(), { onSkipped, canSkip: true });
    await flush();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /skip for now/i.test(b.textContent ?? ""))!.click();
    });

    expect(onSkipped).toHaveBeenCalled();
  });
});
