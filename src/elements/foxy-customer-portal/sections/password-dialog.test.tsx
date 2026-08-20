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
async function render(
  patch = vi.fn(async (_body: Record<string, unknown>) => ({})),
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

  it("shows a field-level error on the current password and stays open on UNAUTHORIZED", async () => {
    const patch = vi.fn(async () => {
      throw Object.assign(new Error("nope"), { code: "UNAUTHORIZED" });
    });
    const { onClose } = await render(patch);

    fill("wrong", "new-secret");
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/not your current password/i);
  });

  it("stays open and shows a generic error on any other failure", async () => {
    const patch = vi.fn(async () => {
      throw new Error("nope");
    });
    const { onClose } = await render(patch);

    fill("old-secret", "new-secret");
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });
});
