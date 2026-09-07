import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { act } from "react";
import { page } from "vitest/browser";
import { RequestCache } from "@/lib/customer-api";
import { mountScreen, setInputValue, type MountedScreen } from "../../test-utils";
import { AddressPage, AddressPageContainer } from "./address-page";
import type { AddressResource } from "./card";

let screen: MountedScreen | null = null;

// The viewport restore is unconditional, like row.test.tsx's: the two
// layout tests below change it, and a thrown assertion must not leak a wide
// or narrow viewport into a later test. Vitest browser mode defaults to
// 414x896.
afterEach(async () => {
  screen?.unmount();
  screen = null;
  await page.viewport(414, 896);
});

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Same rationale as edit-dialog.test.tsx: the real client's `patch` resolves
// with a `Response`-shaped value whatever the status; it never rejects.
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
// `click` is treated as an invalid mouse click and ignored.
function selectOption(option: HTMLElement) {
  option.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
  );
  option.click();
}

function address(
  overrides: Record<string, unknown> = {},
  patch?: Mock<
    (body: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>
  >,
): AddressResource {
  return {
    address_name: "Home",
    first_name: "Alice",
    last_name: "Anderson",
    company: "",
    phone: "",
    address1: "1 First Street",
    address2: "",
    city: "London",
    region: "",
    postal_code: "SW1A 1AA",
    country: "GB",
    is_default_billing: false,
    is_default_shipping: false,
    date_created: "2020-01-01T00:00:00-0800",
    date_modified: "2020-01-01T00:00:00-0800",
    _links: { self: { href: "/a/7", patch } as never },
    ...overrides,
  } as AddressResource;
}

function submitForm() {
  act(() => {
    document
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

describe("AddressPage", () => {
  it("pairs the fields an address form keeps together", async () => {
    await page.viewport(900, 900);

    screen = mountScreen(
      <AddressPage address={address() as never} onBack={vi.fn()} />,
      {},
    );

    const box = (autocomplete: string) =>
      screen!.host
        .querySelector(`input[autocomplete="${autocomplete}"]`)!
        .getBoundingClientRect();

    // First/last name, country/region and city/postal code sit two-up, the
    // way address forms conventionally group them. Eleven fields in one
    // column is a long scroll for a form people fill in from memory.
    for (const [a, b] of [
      ["given-name", "family-name"],
      ["address-level2", "postal-code"],
    ] as const) {
      const left = box(a);
      const right = box(b);
      expect(Math.round(left.top), `${a}/${b} share a row`).toBe(
        Math.round(right.top),
      );
      expect(right.left, `${b} sits right of ${a}`).toBeGreaterThan(left.left);
    }
  });

  it("stacks the pairs on a narrow viewport", async () => {
    await page.viewport(420, 900);

    screen = mountScreen(
      <AddressPage address={address() as never} onBack={vi.fn()} />,
      {},
    );

    const first = screen.host
      .querySelector('input[autocomplete="given-name"]')!
      .getBoundingClientRect();
    const last = screen.host
      .querySelector('input[autocomplete="family-name"]')!
      .getBoundingClientRect();

    // Two text inputs sharing a phone's width are narrower than the content
    // they hold, so the grid collapses to one column below 560px.
    expect(Math.round(last.top)).toBeGreaterThan(Math.round(first.bottom) - 1);
  });

  it("prefills from the address resource and has a Back button", () => {
    screen = mountScreen(
      <AddressPage address={address() as never} onBack={vi.fn()} />,
      {},
    );

    const first = screen.host.querySelector<HTMLInputElement>(
      'input[autocomplete="given-name"]',
    )!;
    expect(first.value).toBe("Alice");

    const buttons = [...screen.host.querySelectorAll("button")];
    expect(buttons.some((b) => /^back$/i.test(b.textContent ?? ""))).toBe(
      true,
    );
  });

  it("prefills every field from the address prop", async () => {
    screen = mountScreen(
      <AddressPage
        address={
          address({
            first_name: "Jane",
            last_name: "Doe",
            company: "Acme Inc",
            phone: "555-1234",
            address1: "123 Main St",
            address2: "Suite 2",
            city: "Springfield",
            postal_code: "62701",
          }) as never
        }
        onBack={vi.fn()}
      />,
      {},
    );

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

  it("saves the edited fields, never is_default_billing/is_default_shipping, and returns home", async () => {
    const patch: Mock<
      (body: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>
    > = vi.fn(async () => ok());
    const onBack = vi.fn();

    screen = mountScreen(
      <AddressPage address={address({}, patch) as never} onBack={onBack} />,
      {},
    );

    const city = screen.host.querySelector<HTMLInputElement>(
      'input[autocomplete="address-level2"]',
    )!;
    act(() => setInputValue(city, "Manchester"));

    submitForm();
    await flush();

    expect(patch).toHaveBeenCalled();
    const body = patch.mock.calls[0][0] as Record<string, unknown>;
    expect(body).not.toHaveProperty("is_default_billing");
    expect(body).not.toHaveProperty("is_default_shipping");
    expect(body).toMatchObject({ city: "Manchester" });
    expect(onBack).toHaveBeenCalled();
  });

  it("invalidates the shared cache after a successful save, per the plan's Global Constraints", async () => {
    // `mountScreen` builds its own `RequestCache` per call and never hands
    // it back to the test -- spying on the prototype method is what lets
    // this assert `cache.clear()` (not an `onSaved` callback) is what
    // `AddressPage` invalidates through, matching `ProfilePage`/
    // `SubscriptionPage`.
    const clearSpy = vi.spyOn(RequestCache.prototype, "clear");
    const patch = vi.fn(async () => ok());

    screen = mountScreen(
      <AddressPage address={address({}, patch) as never} onBack={vi.fn()} />,
      {},
    );

    submitForm();
    await flush();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("patches exactly the 11 owned fields", async () => {
    const patch = vi.fn(async () => ok());

    screen = mountScreen(
      <AddressPage
        address={
          address(
            {
              first_name: "Jane",
              last_name: "Doe",
              company: "Acme Inc",
              phone: "555-1234",
              address1: "123 Main St",
              address2: "Suite 2",
              city: "Springfield",
              postal_code: "62701",
              country: "US",
              region: "IL",
            },
            patch,
          ) as never
        }
        onBack={vi.fn()}
      />,
      {},
    );

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
  });

  it("pre-selects the stored country in the Country select", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "US" }) as never}
        onBack={vi.fn()}
      />,
      {},
    );

    const trigger = getControlByLabelText("Country");
    act(() => trigger.click());

    const option = getOptionByText("United States");
    expect(option?.getAttribute("aria-selected")).toBe("true");
  });

  it("renders the region control as a Select pre-selected to the stored region, for a country with a predefined region list", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "AU", region: "NSW" }) as never}
        onBack={vi.fn()}
      />,
      {},
    );

    const trigger = getControlByLabelText("Region");
    expect(trigger.getAttribute("role")).toBe("combobox");

    act(() => trigger.click());

    const option = getOptionByText("New South Wales");
    expect(option?.getAttribute("aria-selected")).toBe("true");
  });

  it("renders the region control as a free-text input pre-filled with the stored value, for a country with no region list", async () => {
    screen = mountScreen(
      <AddressPage
        address={
          address({ country: "AF", region: "Kabul Province" }) as never
        }
        onBack={vi.fn()}
      />,
      {},
    );

    expect(getInputByLabelText("Region").value).toBe("Kabul Province");
  });

  it("clears the region when switching into a country with a region list", async () => {
    screen = mountScreen(
      <AddressPage
        address={
          address({ country: "AF", region: "Somewhere Custom" }) as never
        }
        onBack={vi.fn()}
      />,
      {},
    );

    expect(getInputByLabelText("Region").value).toBe("Somewhere Custom");

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Australia")!));

    const regionTrigger = getControlByLabelText("Region");
    expect(regionTrigger.getAttribute("role")).toBe("combobox");

    act(() => regionTrigger.click());

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
    screen = mountScreen(
      <AddressPage
        address={address({ country: "US", region: "IL" }) as never}
        onBack={vi.fn()}
      />,
      {},
    );

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Afghanistan")!));

    expect(getInputByLabelText("Region").value).toBe("");
  });

  it("sends the newly selected country and cleared region in the patch body", async () => {
    const patch = vi.fn(async () => ok());

    screen = mountScreen(
      <AddressPage
        address={address({ country: "US", region: "IL" }, patch) as never}
        onBack={vi.fn()}
      />,
      {},
    );

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Afghanistan")!));

    submitForm();
    await flush();

    expect(patch).toHaveBeenCalledWith(
      expect.objectContaining({ country: "AF", region: "" }),
    );
  });

  it("stays on the page and shows an error when the API rejects the save", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));
    const onBack = vi.fn();

    screen = mountScreen(
      <AddressPage address={address({}, patch) as never} onBack={onBack} />,
      {},
    );

    submitForm();
    await flush();

    expect(onBack).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("routes to sign-in on a 401 instead of showing the generic error", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 401 }));
    const onUnauthenticated = vi.fn();
    const onBack = vi.fn();

    screen = mountScreen(
      <AddressPage address={address({}, patch) as never} onBack={onBack} />,
      {},
      onUnauthenticated,
    );

    submitForm();
    await flush();

    expect(onUnauthenticated).toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toMatch(/something went wrong/i);
  });

  it("shows the display name, not the raw code, in the closed Country trigger", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "GB" }) as never}
        onBack={vi.fn()}
      />,
      {},
    );

    const trigger = getControlByLabelText("Country");
    expect(trigger.textContent).toBe("United Kingdom");
    expect(trigger.textContent).not.toBe("GB");
  });

  it("shows the display name, not the raw code, in the closed Region trigger", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "AU", region: "NSW" }) as never}
        onBack={vi.fn()}
      />,
      {},
    );

    const trigger = getControlByLabelText("Region");
    expect(trigger.textContent).toBe("New South Wales");
    expect(trigger.textContent).not.toBe("NSW");
  });

  describe("validation", () => {
    it("marks only Address label and Address line 1 as required", async () => {
      screen = mountScreen(
        <AddressPage address={address() as never} onBack={vi.fn()} />,
        {},
      );

      expect(getInputByLabelText("Address label").required).toBe(true);
      expect(getInputByLabelText("Address line 1").required).toBe(true);

      expect(getInputByLabelText("First name").required).toBe(false);
      expect(getInputByLabelText("Last name").required).toBe(false);
      expect(getInputByLabelText("Company").required).toBe(false);
      expect(getInputByLabelText("Phone").required).toBe(false);
      expect(getInputByLabelText("Address line 2").required).toBe(false);
      expect(getInputByLabelText("City").required).toBe(false);
      expect(getInputByLabelText("Postal code").required).toBe(false);
    });

    it("caps address_name, address1, and address2 at 100 characters", async () => {
      screen = mountScreen(
        <AddressPage address={address() as never} onBack={vi.fn()} />,
        {},
      );

      expect(getInputByLabelText("Address label").maxLength).toBe(100);
      expect(getInputByLabelText("Address line 1").maxLength).toBe(100);
      expect(getInputByLabelText("Address line 2").maxLength).toBe(100);
    });

    it("caps the other text fields at 50 characters", async () => {
      screen = mountScreen(
        <AddressPage
          address={
            address({ country: "AF", region: "Kabul Province" }) as never
          }
          onBack={vi.fn()}
        />,
        {},
      );

      expect(getInputByLabelText("First name").maxLength).toBe(50);
      expect(getInputByLabelText("Last name").maxLength).toBe(50);
      expect(getInputByLabelText("Company").maxLength).toBe(50);
      expect(getInputByLabelText("Phone").maxLength).toBe(50);
      expect(getInputByLabelText("City").maxLength).toBe(50);
      expect(getInputByLabelText("Postal code").maxLength).toBe(50);
      expect(getInputByLabelText("Region").maxLength).toBe(50);
    });
  });

  it("blocks submit when the address label is cleared", async () => {
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    const onBack = vi.fn();
    screen = mountScreen(
      <AddressPage address={address({}, patch) as never} onBack={onBack} />,
      {},
    );

    const label = screen.host.querySelector<HTMLInputElement>(
      "input[required]",
    )!;
    act(() => setInputValue(label, ""));

    act(() => {
      screen!.host
        .querySelector("form")!
        .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();

    expect(patch).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    expect(screen.host.textContent).toMatch(/required/i);
  });

  it("blocks submit when address line 1 exceeds the API's 100-character limit", async () => {
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    screen = mountScreen(
      <AddressPage address={address({}, patch) as never} onBack={vi.fn()} />,
      {},
    );

    const line1 = screen.host.querySelector<HTMLInputElement>(
      'input[autocomplete="address-line1"]',
    )!;
    act(() => setInputValue(line1, "x".repeat(101)));

    act(() => {
      screen!.host
        .querySelector("form")!
        .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();

    expect(patch).not.toHaveBeenCalled();
    expect(screen.host.textContent).toMatch(/100/);
  });

  it("does not block submit over a blank optional field like company", async () => {
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    const onBack = vi.fn();
    screen = mountScreen(
      <AddressPage
        address={address({ company: "" }, patch) as never}
        onBack={onBack}
      />,
      {},
    );

    act(() => {
      screen!.host
        .querySelector("form")!
        .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await flush();

    expect(patch).toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
  });
});

describe("AddressPageContainer", () => {
  it("renders immediately from a resource already in memory, with no fetch", async () => {
    const link = { href: "/addresses", get: vi.fn() };

    screen = mountScreen(
      <AddressPageContainer
        id="7"
        resource={address() as never}
        addressesLink={link as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(link.get).not.toHaveBeenCalled();
    expect(
      screen.host.querySelector<HTMLInputElement>(
        'input[autocomplete="given-name"]',
      )!.value,
    ).toBe("Alice");
  });

  it("fetches by id when no resource was handed in", async () => {
    const link = {
      href: "/addresses",
      get: vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          total_items: 1,
          _embedded: { "fx:customer_addresses": [address()] },
        }),
      })),
    };

    screen = mountScreen(
      <AddressPageContainer id="7" addressesLink={link as never} onBack={vi.fn()} />,
      {},
    );
    await flush();

    expect(link.get).toHaveBeenCalled();
  });

  it("shows a Back-aware error when the id resolves to nothing", async () => {
    const link = {
      href: "/addresses",
      get: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ total_items: 0, _embedded: {} }),
      }),
    };
    const onBack = vi.fn();

    screen = mountScreen(
      <AddressPageContainer id="missing" addressesLink={link as never} onBack={onBack} />,
      {},
    );
    await flush();

    expect(screen.host.textContent).toMatch(/something went wrong/i);

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
