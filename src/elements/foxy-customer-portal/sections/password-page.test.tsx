import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { PasswordPage } from "./password-page";

let screen: MountedScreen | null = null;

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

function renderPage({
  patch = vi.fn(async () => ({ ok: true, status: 200 })),
  onBack = vi.fn(),
  onUnauthenticated = vi.fn(),
}: {
  patch?: ReturnType<typeof vi.fn>;
  onBack?: () => void;
  onUnauthenticated?: () => void;
} = {}) {
  const customer = { _links: { self: { href: "/c", patch } } };

  screen = mountScreen(
    <PasswordPage customer={customer as never} onBack={onBack} />,
    {},
    onUnauthenticated,
  );

  return { patch, onBack, onUnauthenticated };
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

function submit() {
  act(() => {
    document
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

describe("PasswordPage", () => {
  it("has a Back button that returns to home", () => {
    const { onBack } = renderPage();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("patches the new and current password", async () => {
    const { patch } = renderPage();

    const current = document.querySelector<HTMLInputElement>(
      'input[autocomplete="current-password"]',
    )!;
    const next = document.querySelector<HTMLInputElement>(
      'input[autocomplete="new-password"]',
    )!;

    act(() => setInputValue(current, "old-pw"));
    act(() => setInputValue(next, "new-pw"));
    submit();
    await flush();

    expect(patch).toHaveBeenCalledWith({
      password: "new-pw",
      password_old: "old-pw",
    });
  });

  it("returns home after a successful save", async () => {
    const { onBack } = renderPage();
    submit();
    await flush();

    expect(onBack).toHaveBeenCalled();
  });

  it("shows a field-level error for a wrong current password, without leaving the page", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 401 }));
    const { onBack, onUnauthenticated } = renderPage({ patch });

    submit();
    await flush();

    expect(document.body.textContent).toMatch(/not your current password/i);
    expect(onBack).not.toHaveBeenCalled();
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("shows a generic error for an ordinary rejection", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));
    renderPage({ patch });

    submit();
    await flush();

    expect(document.body.textContent).toMatch(/something went wrong/i);
  });
});
