import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { ProfileDialog } from "./profile-dialog";

let screen: MountedScreen | null = null;

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Base UI's `Dialog.Root` finishes opening in an effect after mount (it needs
// a frame to compute positioning), so callers must flush once before the
// popup's contents exist in the document — unlike a plain component, which
// is fully rendered synchronously by `mountScreen`.
/**
 * The `patch` doubles resolve with a response and never reject, because that
 * is what the real client does: `Node.patch` hands back the SDK `Response`
 * whatever the status, and only `signIn`, `signUp`, `sendPasswordResetEmail`
 * and `signOut` ever throw an `AuthError`.
 */
const ok = () => ({ ok: true, status: 200 });
const rejected = (status: number) => () => ({ ok: false, status });

async function renderDialog({
  patch = vi.fn(async (_body: Record<string, unknown>) => ok()),
  onClose = vi.fn(),
  onUnauthenticated = vi.fn(),
}: {
  patch?: Mock<
    (body: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>
  >;
  onClose?: () => void;
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
    <ProfileDialog customer={customer as never} open onClose={onClose} />,
    {},
    onUnauthenticated,
  );
  await flush();

  return { patch, onClose, onUnauthenticated };
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

describe("ProfileDialog", () => {
  it("prefills from the customer resource", async () => {
    await renderDialog();
    const first = document.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;
    expect(first.value).toBe("Ada");
  });

  it("patches only the profile fields, never the password", async () => {
    const { patch } = await renderDialog();
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

  it("closes after a successful save", async () => {
    const { onClose } = await renderDialog();

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onClose).toHaveBeenCalled();
  });

  it("stays open and shows an error when the API rejects the save", async () => {
    const patch = vi.fn(async () => rejected(422)());
    const { onClose } = await renderDialog({ patch });

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("routes to sign-in when the session is gone", async () => {
    const onUnauthenticated = vi.fn();
    const patch = vi.fn(async () => ({ ok: false, status: 401 }));
    const onClose = vi.fn();

    await renderDialog({ patch, onClose, onUnauthenticated });

    act(() => {
      document
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
    });
    await flush();

    expect(onUnauthenticated).toHaveBeenCalled();
    // The dialog must not also claim the save failed for some other reason.
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not route to sign-in on an ordinary rejection", async () => {
    const onUnauthenticated = vi.fn();
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));

    await renderDialog({ patch, onUnauthenticated });

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
