import { afterEach, describe, expect, it, vi } from "vitest";
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
    <ProfileDialog customer={customer as never} open onClose={onClose} />,
    {},
  );
  await flush();

  return { patch, onClose };
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

describe("ProfileDialog", () => {
  it("prefills from the customer resource", async () => {
    await render();
    const first = document.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;
    expect(first.value).toBe("Ada");
  });

  it("patches only the profile fields, never the password", async () => {
    const { patch } = await render();
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
    const { onClose } = await render();

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

  it("stays open and shows an error when the save fails", async () => {
    const patch = vi.fn(async () => {
      throw new Error("nope");
    });
    const { onClose } = await render(patch);

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
});
