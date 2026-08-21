// src/elements/foxy-customer-portal/sections/addresses/edit-dialog.test.tsx
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { act } from "react";
import { mountScreen, setInputValue, type MountedScreen } from "../../test-utils";
import { AddressEditDialog } from "./edit-dialog";
import type { AddressResource } from "./card";

let screen: MountedScreen | null = null;

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Same rationale as profile-dialog.test.tsx: the real client's `patch`
// resolves with a `Response`-shaped value whatever the status; it never
// rejects.
const ok = () => ({ ok: true, status: 200 });

function getInputByLabelText(text: string): HTMLInputElement {
  const label = Array.from(document.querySelectorAll("label")).find(
    (el) => el.textContent === text,
  );

  if (!label) throw new Error(`No label found with text "${text}"`);

  const forId = label.getAttribute("for");
  const input = forId && document.getElementById(forId);

  if (!input) throw new Error(`No input found for label "${text}"`);

  return input as HTMLInputElement;
}

function address(
  overrides: Partial<AddressResource> = {},
  patch: Mock<
    (body: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>
  > = vi.fn(async () => ok()),
): AddressResource {
  return {
    address_name: "Home",
    first_name: "Jane",
    last_name: "Doe",
    company: "Acme Inc",
    phone: "555-1234",
    address1: "123 Main St",
    address2: "Suite 2",
    city: "Springfield",
    region: "IL",
    postal_code: "62701",
    country: "US",
    is_default_billing: false,
    is_default_shipping: false,
    date_created: "2023-01-01T00:00:00-0700",
    date_modified: "2023-01-01T00:00:00-0700",
    _links: { self: { href: "/s/1", patch } as never },
    ...overrides,
  };
}

async function renderDialog({
  patch = vi.fn(async () => ok()),
  onClose = vi.fn(),
  onSaved = vi.fn(),
  onUnauthenticated = vi.fn(),
  addressOverrides = {},
}: {
  patch?: Mock<
    (body: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>
  >;
  onClose?: () => void;
  onSaved?: () => void;
  onUnauthenticated?: () => void;
  addressOverrides?: Partial<AddressResource>;
} = {}) {
  const record = address(addressOverrides, patch);

  screen = mountScreen(
    <AddressEditDialog
      address={record}
      open
      onClose={onClose}
      onSaved={onSaved}
    />,
    {},
    onUnauthenticated,
  );
  await flush();

  return { patch, onClose, onSaved, onUnauthenticated, record };
}

function submitForm() {
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

describe("AddressEditDialog", () => {
  it("prefills every field from the address prop", async () => {
    await renderDialog();

    expect(getInputByLabelText("Address label").value).toBe("Home");
    expect(getInputByLabelText("First name").value).toBe("Jane");
    expect(getInputByLabelText("Last name").value).toBe("Doe");
    expect(getInputByLabelText("Company").value).toBe("Acme Inc");
    expect(getInputByLabelText("Phone").value).toBe("555-1234");
    expect(getInputByLabelText("Address line 1").value).toBe("123 Main St");
    expect(getInputByLabelText("Address line 2").value).toBe("Suite 2");
    expect(getInputByLabelText("City").value).toBe("Springfield");
    expect(getInputByLabelText("Postal code").value).toBe("62701");
  });

  it("patches exactly the 9 owned fields, and never the default flags", async () => {
    const { patch } = await renderDialog();

    act(() => setInputValue(getInputByLabelText("City"), "Shelbyville"));
    submitForm();
    await flush();

    expect(patch).toHaveBeenCalledWith({
      address_name: "Home",
      first_name: "Jane",
      last_name: "Doe",
      company: "Acme Inc",
      phone: "555-1234",
      address1: "123 Main St",
      address2: "Suite 2",
      city: "Shelbyville",
      postal_code: "62701",
    });

    const body = patch.mock.calls[0][0];
    expect(body).not.toHaveProperty("is_default_billing");
    expect(body).not.toHaveProperty("is_default_shipping");
  });

  it("calls onSaved then onClose after a successful save", async () => {
    const calls: string[] = [];
    const onSaved = vi.fn(() => calls.push("onSaved"));
    const onClose = vi.fn(() => calls.push("onClose"));

    await renderDialog({ onSaved, onClose });

    submitForm();
    await flush();

    expect(calls).toEqual(["onSaved", "onClose"]);
  });

  it("stays open and shows an error when the API rejects the save", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));
    const { onClose, onSaved } = await renderDialog({ patch });

    submitForm();
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("routes to sign-in on a 401 instead of showing the generic error", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 401 }));
    const onUnauthenticated = vi.fn();
    const onClose = vi.fn();

    await renderDialog({ patch, onUnauthenticated, onClose });

    submitForm();
    await flush();

    expect(onUnauthenticated).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toMatch(/something went wrong/i);
  });

  it("closes without patching when Cancel is clicked", async () => {
    const { patch, onClose } = await renderDialog();

    const cancelButton = Array.from(
      document.querySelectorAll("button"),
    ).find((el) => el.textContent === "Cancel");

    act(() => cancelButton!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await flush();

    expect(onClose).toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });
});
