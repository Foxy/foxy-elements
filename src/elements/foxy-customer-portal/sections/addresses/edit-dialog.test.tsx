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

// Same lookup as `getInputByLabelText`, but untyped: the Region field is a
// `Select.Trigger` (a `<button role="combobox">`) for countries with a
// predefined region list, and a plain `<input>` otherwise. Both variants
// carry the same `id`, so this is what lets a single helper follow the
// control across that branch.
function getControlByLabelText(text: string): HTMLElement {
  const label = Array.from(document.querySelectorAll("label")).find(
    (el) => el.textContent === text,
  );

  if (!label) throw new Error(`No label found with text "${text}"`);

  const forId = label.getAttribute("for");
  const control = forId && document.getElementById(forId);

  if (!control) throw new Error(`No control found for label "${text}"`);

  return control;
}

function getOptionByText(text: string): HTMLElement | undefined {
  return [...document.querySelectorAll('[role="option"]')].find(
    (o) => o.textContent === text,
  ) as HTMLElement | undefined;
}

// Base UI's Select.Item only commits a mouse click when a prior pointerdown
// marked it as a real (non-virtual) mouse interaction -- a bare synthetic
// `click` is treated as an invalid mouse click and ignored (same rationale as
// manage-dialog.test.tsx's option selection).
function selectOption(option: HTMLElement) {
  option.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
  );
  option.click();
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

  it("patches exactly the 11 owned fields, and never the default flags", async () => {
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
      country: "US",
      region: "IL",
      city: "Shelbyville",
      postal_code: "62701",
    });

    const body = patch.mock.calls[0][0];
    expect(body).not.toHaveProperty("is_default_billing");
    expect(body).not.toHaveProperty("is_default_shipping");
  });

  it("pre-selects the stored country in the Country select", async () => {
    await renderDialog();

    const trigger = getControlByLabelText("Country");
    act(() => trigger.click());

    const option = getOptionByText("United States");
    expect(option?.getAttribute("aria-selected")).toBe("true");
  });

  it("renders the region control as a Select pre-selected to the stored region, for a country with a predefined region list", async () => {
    await renderDialog({ addressOverrides: { country: "AU", region: "NSW" } });

    const trigger = getControlByLabelText("Region");
    expect(trigger.getAttribute("role")).toBe("combobox");

    act(() => trigger.click());

    const option = getOptionByText("New South Wales");
    expect(option?.getAttribute("aria-selected")).toBe("true");
  });

  it("renders the region control as a free-text input pre-filled with the stored value, for a country with no region list", async () => {
    await renderDialog({
      addressOverrides: { country: "AF", region: "Kabul Province" },
    });

    expect(getInputByLabelText("Region").value).toBe("Kabul Province");
  });

  it("clears the region when switching into a country with a region list", async () => {
    await renderDialog({
      addressOverrides: { country: "AF", region: "Somewhere Custom" },
    });

    // Sanity check on the starting shape: free text, not a Select.
    expect(getInputByLabelText("Region").value).toBe("Somewhere Custom");

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Australia")!));

    // The region control has switched to a Select (AU has a region list) and
    // must not carry over the old free-text value as a selection.
    const regionTrigger = getControlByLabelText("Region");
    expect(regionTrigger.getAttribute("role")).toBe("combobox");

    act(() => regionTrigger.click());

    // Scope to this trigger's own listbox (via aria-controls), not a global
    // `[role="option"]` query -- the Country select's now-closing popup can
    // still have its old "Australia" option (now aria-selected, since it
    // matches the just-picked country) lingering in the DOM at this point.
    const listId = regionTrigger.getAttribute("aria-controls");
    const list = listId && document.getElementById(listId);
    if (!list) throw new Error("Region select's listbox did not open");

    const options = [...list.querySelectorAll('[role="option"]')];
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      expect(option.getAttribute("aria-selected")).toBe("false");
    }
  });

  it("clears the region when switching out of a country with a region list", async () => {
    await renderDialog(); // default: country "US", region "IL"

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Afghanistan")!));

    // AF has no region list, so the region control is now free text -- and
    // must not carry over the stale "IL" state code.
    expect(getInputByLabelText("Region").value).toBe("");
  });

  it("sends the newly selected country and cleared region in the patch body", async () => {
    const { patch } = await renderDialog(); // default: country "US", region "IL"

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Afghanistan")!));

    submitForm();
    await flush();

    expect(patch).toHaveBeenCalledWith(
      expect.objectContaining({ country: "AF", region: "" }),
    );
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
