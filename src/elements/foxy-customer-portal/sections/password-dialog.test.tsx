import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../test-utils";
import { PasswordDialog } from "./password-dialog";

let screen: MountedScreen | null = null;

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Base UI's `Dialog.Root` finishes opening in an effect after mount, so the
// popup's contents don't exist in the document until after a flush — see
// `profile-dialog.test.tsx` for the same note.
/**
 * As in `profile-dialog.test.tsx`: the real client reports a rejected write
 * through the response status, never by throwing. A fake that threw an
 * `AuthError`-shaped object would be testing a code path production can never
 * reach.
 */
const ok = () => ({ ok: true, status: 200 });
const rejected = (status: number) => () => ({ ok: false, status });

async function render(
  patch = vi.fn(async (_body: Record<string, unknown>) => ok()),
  onClose = vi.fn(),
) {
  const customer = {
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    tax_id: "",
    _links: { self: { href: "/c", patch } },
  };

  screen = mountScreen(
    <PasswordDialog customer={customer as never} open onClose={onClose} />,
    {},
  );
  await flush();

  return { patch, onClose };
}

function fill(current: string, next: string) {
  const password = document.querySelectorAll<HTMLInputElement>(
    'input[type="password"]',
  );
  act(() => {
    setInputValue(password[0], current);
    setInputValue(password[1], next);
  });

  act(() => {
    document
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

describe("PasswordDialog", () => {
  it("patches the current and new password, never the profile fields", async () => {
    const { patch } = await render();

    fill("old-secret", "new-secret");
    await flush();

    expect(patch).toHaveBeenCalledWith({
      password: "new-secret",
      password_old: "old-secret",
    });
    expect(patch.mock.calls[0][0]).not.toHaveProperty("first_name");
  });

  it("closes after a successful save", async () => {
    const { onClose } = await render();

    fill("old-secret", "new-secret");
    await flush();

    expect(onClose).toHaveBeenCalled();
  });

  it("shows a field-level error on the current password and stays open on a 401", async () => {
    const patch = vi.fn(async () => rejected(401)());
    const { onClose } = await render(patch);

    fill("wrong", "new-secret");
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/not your current password/i);
  });

  it("treats a 403 as a wrong current password too", async () => {
    const { onClose } = await render(vi.fn(async () => rejected(403)()));

    fill("wrong", "new-secret");
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/not your current password/i);
  });

  it("stays open and shows a generic error on any other failure", async () => {
    const { onClose } = await render(vi.fn(async () => rejected(500)()));

    fill("old-secret", "new-secret");
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
    expect(document.body.textContent).not.toMatch(/not your current password/i);
  });
});
