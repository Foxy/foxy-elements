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
  countryQueries = [];
  regionQueries = [];
  await page.viewport(414, 896);
});

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

// Same rationale as edit-dialog.test.tsx: the real client's `patch` resolves
// with a `Response`-shaped value whatever the status; it never rejects.
const ok = () => ({ ok: true, status: 200 });

/**
 * The store's country list, in the v1 property-helper shape the API returns.
 *
 * Deliberately a small subset rather than every country: the point of this
 * work is that the form offers what the STORE sells to, so a fixture holding
 * all 254 would hide the very behaviour under test.
 */
const COUNTRY_VALUES = {
  US: { default: "United States", cc2: "US", cc3: "USA", has_regions: true, regions_type: "state", active: true },
  AU: { default: "Australia", cc2: "AU", cc3: "AUS", has_regions: true, regions_type: "state", active: true },
  CA: { default: "Canada", cc2: "CA", cc3: "CAN", has_regions: true, regions_type: "province", active: true },
  JP: { default: "Japan", cc2: "JP", cc3: "JPN", has_regions: true, regions_type: "prefecture", active: true },
  AF: { default: "Afghanistan", cc2: "AF", cc3: "AFG", has_regions: false, regions_type: null, active: true },
};

const REGION_VALUES: Record<string, Record<string, unknown>> = {
  US: { IL: { default: "Illinois", code: "IL", active: true }, CA: { default: "California", code: "CA", active: true } },
  AU: { NSW: { default: "New South Wales", code: "NSW", active: true }, VIC: { default: "Victoria", code: "VIC", active: true } },
  CA: { ON: { default: "Ontario", code: "ON", active: true } },
  JP: { "13": { default: "Tokyo", code: "13", active: true } },
};

/**
 * Reads one `key=value` out of a `filters` array.
 *
 * The SDK's `Node.get()` only serializes `{ filters, fields, offset, limit,
 * order, zoom }` -- a loose `{ address_type }` is dropped without a word. So
 * the portal sends these as filters, and the fixtures read them the same way
 * the real endpoint would.
 */
function filterValue(query: Record<string, unknown> | undefined, key: string) {
  const filters = (query?.filters as string[] | undefined) ?? [];
  const match = filters.find((entry) => entry.startsWith(`${key}=`));
  return match ? match.slice(key.length + 1) : "";
}

/** Records the query each call was made with, so tests can assert on it. */
let countryQueries: Record<string, unknown>[] = [];
let regionQueries: Record<string, unknown>[] = [];

function countriesLink(values: unknown = COUNTRY_VALUES) {
  return {
    href: "/property_helpers/countries",
    get: async (query?: Record<string, unknown>) => {
      countryQueries.push(query ?? {});
      return { ok: true, status: 200, json: async () => ({ values }) };
    },
  };
}

function regionsLink(byCountry = REGION_VALUES) {
  return {
    href: "/property_helpers/regions",
    get: async (query?: Record<string, unknown>) => {
      regionQueries.push(query ?? {});
      const code = filterValue(query, "country_code");
      return {
        ok: true,
        status: 200,
        json: async () => ({ values: byCountry[code] ?? {} }),
      };
    },
  };
}

/** A link whose read fails, for the free-text fallback path. */
function failingLink() {
  return {
    href: "/property_helpers/countries",
    get: async () => ({ ok: false, status: 500, json: async () => ({}) }),
  };
}

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
      <AddressPage
        address={address() as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
      <AddressPage
        address={address() as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
      <AddressPage
        address={address() as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
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
      <AddressPage
        address={address({}, patch) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={onBack}
      />,
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
      <AddressPage
        address={address({}, patch) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
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

  it("asks for the list that governs this address", async () => {
    // Billing and shipping addresses are separate records, so an address has
    // exactly one type. An address flagged NEITHER is inferred as shipping by
    // Foxy -- treating it as unconstrained would offer countries the store
    // cannot ship to.
    screen = mountScreen(
      <AddressPage
        address={address({ is_default_billing: false }) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(filterValue(countryQueries[0], "address_type")).toBe("shipping");
  });

  it("asks for the billing list for a default billing address", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ is_default_billing: true }) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(filterValue(countryQueries[0], "address_type")).toBe("billing");
  });

  it("offers only the countries the store sells to", async () => {
    // The whole point of the change: the form used to offer all 254
    // countries from a hardcoded table, including ones checkout rejects.
    screen = mountScreen(
      <AddressPage
        address={address({ country: "US" }) as never}
        countriesLink={countriesLink({
          US: { default: "United States", cc2: "US", has_regions: false },
          CA: { default: "Canada", cc2: "CA", has_regions: false },
        }) as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    act(() => getControlByLabelText("Country").click());

    const options = [...document.querySelectorAll('[role="option"]')].map(
      (option) => option.textContent?.trim(),
    );

    expect(options).toEqual(["Canada", "United States"]);
    expect(options).not.toContain("Afghanistan");
  });

  it("falls back to free text when the country list cannot be read", async () => {
    // Failure rule 1. A reference list that did not load must never stop a
    // customer fixing their own address.
    screen = mountScreen(
      <AddressPage
        address={address({ country: "GB" }) as never}
        countriesLink={failingLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    const control = getControlByLabelText("Country");
    expect(control.tagName).toBe("INPUT");
    expect((control as HTMLInputElement).value).toBe("GB");
  });

  it("keeps a saved country the store no longer offers", async () => {
    // Failure rule 2, and the highest-value test in FX-369: a store can
    // narrow its countries after an address was saved. Dropping the value
    // would mean editing an unrelated field silently rewrote the customer's
    // country.
    const patch = vi.fn(async (_body: Record<string, unknown>) => ok());

    screen = mountScreen(
      <AddressPage
        address={
          address({ country: "JP", region: "" }, patch) as never
        }
        countriesLink={countriesLink({
          US: { default: "United States", cc2: "US", has_regions: false },
        }) as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );
    await flush();

    // Still offered, so the customer can see and keep it.
    act(() => getControlByLabelText("Country").click());
    expect(
      [...document.querySelectorAll('[role="option"]')].map((o) =>
        o.textContent?.trim(),
      ),
    ).toContain("Japan");

    act(() => document.body.click());
    submitForm();
    await flush();

    // And saving an unrelated edit leaves it exactly as it was.
    expect(patch).toHaveBeenCalled();
    expect(patch.mock.calls[0]?.[0]?.country).toBe("JP");
  });

  it("labels the region field the way the country does", async () => {
    // "State" for the US, "Prefecture" for Japan. The field read "Region" for
    // every country before the store's list carried `regions_type`.
    for (const [country, label] of [
      ["US", "State"],
      ["CA", "Province"],
      ["JP", "Prefecture"],
    ] as const) {
      screen = mountScreen(
        <AddressPage
          address={address({ country, region: "" }) as never}
          countriesLink={countriesLink() as never}
          regionsLink={regionsLink() as never}
          onBack={vi.fn()}
        />,
        {},
      );
      await flush();

      expect(
        [...document.querySelectorAll("label")].map((l) => l.textContent),
        `${country} labels its regions "${label}"`,
      ).toContain(label);

      screen.unmount();
      screen = null;
    }
  });

  it("pre-selects the stored country in the Country select", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "US" }) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

    const trigger = getControlByLabelText("Country");
    act(() => trigger.click());

    const option = getOptionByText("United States");
    expect(option?.getAttribute("aria-selected")).toBe("true");
  });

  it("renders the region control as a Select pre-selected to the stored region, for a country with a predefined region list", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "AU", region: "NSW" }) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

    // Labelled "State" rather than "Region": AU's `regions_type` is "state".
    const trigger = getControlByLabelText("State");
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

    expect(getInputByLabelText("Region").value).toBe("Kabul Province");
  });

  it("clears the region when switching into a country with a region list", async () => {
    screen = mountScreen(
      <AddressPage
        address={
          address({ country: "AF", region: "Somewhere Custom" }) as never
        }
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

    expect(getInputByLabelText("Region").value).toBe("Somewhere Custom");

    const countryTrigger = getControlByLabelText("Country");
    act(() => countryTrigger.click());
    act(() => selectOption(getOptionByText("Australia")!));
    await flush();

    // The label follows the country: AF has no `regions_type` and reads
    // "Region", AU is "state" and reads "State".
    const regionTrigger = getControlByLabelText("State");
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

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
      <AddressPage
        address={address({}, patch) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={onBack}
      />,
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
      <AddressPage
        address={address({}, patch) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={onBack}
      />,
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

    const trigger = getControlByLabelText("Country");
    expect(trigger.textContent).toBe("United Kingdom");
    expect(trigger.textContent).not.toBe("GB");
  });

  it("shows the display name, not the raw code, in the closed Region trigger", async () => {
    screen = mountScreen(
      <AddressPage
        address={address({ country: "AU", region: "NSW" }) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
      {},
    );

    await flush();

    // "State", not "Region": AU's `regions_type` is "state", and the field
    // now takes its label from the country rather than always reading
    // "Region".
    const trigger = getControlByLabelText("State");
    expect(trigger.textContent).toBe("New South Wales");
    expect(trigger.textContent).not.toBe("NSW");
  });

  describe("validation", () => {
    it("marks only Address label and Address line 1 as required", async () => {
      screen = mountScreen(
        <AddressPage
        address={address() as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
        <AddressPage
        address={address() as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
      <AddressPage
        address={address({}, patch) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={onBack}
      />,
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
      <AddressPage
        address={address({}, patch) as never}
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
        onBack={vi.fn()}
      />,
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
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
        countriesLink={countriesLink() as never}
        regionsLink={regionsLink() as never}
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
