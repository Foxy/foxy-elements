import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { ProfilePage } from "./profile-page";

let screen: MountedScreen | null = null;

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

const ok = () => ({ ok: true, status: 200 });

function renderPage({
  patch = vi.fn(async (_body: Record<string, unknown>) => ok()),
  onBack = vi.fn(),
  onUnauthenticated = vi.fn(),
}: {
  patch?: Mock<
    (body: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>
  >;
  onBack?: () => void;
  onUnauthenticated?: () => void;
} = {}) {
  const customer = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    tax_id: "",
    _links: { self: { href: "/c", patch } },
  };

  screen = mountScreen(
    <ProfilePage customer={customer as never} onBack={onBack} />,
    {},
    onUnauthenticated,
  );

  return { patch, onBack, onUnauthenticated };
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

describe("ProfilePage", () => {
  it("prefills from the customer resource", () => {
    renderPage();
    const first = document.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;
    expect(first.value).toBe("Ada");
  });

  it("has a Back button that returns to home", () => {
    const { onBack } = renderPage();

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("patches only the profile fields, never the password", async () => {
    const { patch } = renderPage();
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

    expect(patch).toHaveBeenCalledWith({
      first_name: "Augusta",
      last_name: "Lovelace",
      email: "ada@example.com",
      tax_id: "",
    });
    expect(patch.mock.calls[0][0]).not.toHaveProperty("password");
  });

  it("returns home after a successful save", async () => {
    const { onBack } = renderPage();

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onBack).toHaveBeenCalled();
  });

  it("stays put and shows an error when the API rejects the save", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));
    const { onBack } = renderPage({ patch });

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onBack).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("routes to sign-in when the session is gone, without treating it as a save", async () => {
    const onUnauthenticated = vi.fn();
    const patch = vi.fn(async () => ({ ok: false, status: 401 }));
    const { onBack } = renderPage({ patch, onUnauthenticated });

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onUnauthenticated).toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });

  it("does not route to sign-in on an ordinary rejection", async () => {
    const onUnauthenticated = vi.fn();
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));

    renderPage({ patch, onUnauthenticated });

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onUnauthenticated).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("blocks submit and shows a message when email is cleared", async () => {
    const { patch, onBack } = renderPage();
    const email = document.querySelector<HTMLInputElement>(
      'input[autocomplete="email"]',
    )!;

    act(() => setInputValue(email, ""));

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(patch).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/required/i);
  });

  it("shows a message on blur for a malformed email, without waiting for submit", async () => {
    renderPage();
    const email = document.querySelector<HTMLInputElement>(
      'input[autocomplete="email"]',
    )!;

    act(() => setInputValue(email, "not-an-email"));
    await flush();

    expect(document.body.textContent).toMatch(/valid email/i);
  });

  it("blocks submit when first name exceeds the API's 50-character limit", async () => {
    const { patch } = renderPage();
    const first = document.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;

    act(() => setInputValue(first, "x".repeat(51)));

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(patch).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/50/);
  });

  it("clears the email error once a valid address is entered", async () => {
    renderPage();
    const email = document.querySelector<HTMLInputElement>(
      'input[autocomplete="email"]',
    )!;

    act(() => setInputValue(email, "not-an-email"));
    await flush();
    expect(document.body.textContent).toMatch(/valid email/i);

    act(() => setInputValue(email, "ada@example.com"));
    await flush();
    expect(document.body.textContent).not.toMatch(/valid email/i);
  });

  it("shows errors live as the user types (not just on blur)", () => {
    renderPage();
    const first = document.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;

    act(() => setInputValue(first, "x".repeat(60)));

    expect(document.body.textContent).toMatch(/50/);
  });
});
