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
});
