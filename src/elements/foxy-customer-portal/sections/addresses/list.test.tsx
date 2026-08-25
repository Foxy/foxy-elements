import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { BillingShippingSection } from "./list";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const ADDRESSES_HREF = "https://demo.foxycart.com/s/customer/addresses";
const PAYMENT_METHOD_HREF =
  "https://demo.foxycart.com/s/customer/default_payment_method";

function customer(
  getAddresses: (query?: Record<string, unknown>) => Promise<unknown>,
  getPaymentMethod: () => Promise<unknown> = async () =>
    page404NoPaymentMethod(),
) {
  return {
    _links: {
      self: { href: "/s/customer" },
      "fx:customer_addresses": { href: ADDRESSES_HREF, get: getAddresses },
      "fx:default_payment_method": {
        href: PAYMENT_METHOD_HREF,
        get: getPaymentMethod,
      },
    },
  };
}

function page404NoPaymentMethod() {
  return { ok: true, status: 200, json: async () => ({ cc_type: "", cc_number_masked: "" }) };
}

function page(addresses: unknown[], totalItems = addresses.length) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      total_items: totalItems,
      _embedded: { "fx:customer_addresses": addresses },
    }),
  };
}

function address(
  id: number,
  overrides: Record<string, unknown> = {},
) {
  return {
    address_name: `Address ${id}`,
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
    ...overrides,
    _links: { self: { href: `/s/${id}` } },
  };
}

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function editButtons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>("button")].filter(
    (button) => /^edit$/i.test(button.textContent ?? ""),
  );
}

describe("BillingShippingSection", () => {
  it("shows the Billing & Shipping heading", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={customer(async () => page([])) as never}
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/billing & shipping/i);
  });

  it("shows the default payment method", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () => page([]), async () => ({
            ok: true,
            status: 200,
            json: async () => ({
              cc_type: "visa",
              cc_number_masked: "4242",
              cc_exp_month: "08",
              cc_exp_year: "2028",
            }),
          })) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/visa/i);
    expect(document.body.textContent).toMatch(/4242/);
  });

  it("shows the billing and shipping address summary from the default-flagged addresses", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () =>
            page([
              address(1, { first_name: "Billing", is_default_billing: true }),
              address(2, { first_name: "Shipping", is_default_shipping: true }),
            ]),
          ) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    // Both `/billing address/i` and `/shipping address/i` also match the
    // empty-state fallback text ("No billing/shipping address set."), so
    // they alone wouldn't prove the actual address data rendered. Assert on
    // the address's own name instead -- it only appears once the address
    // record is actually shown.
    expect(document.body.textContent).toMatch(/Billing Anderson/);
    expect(document.body.textContent).toMatch(/Shipping Anderson/);
  });

  it("does not show the no-address messages while the address read is still loading", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={customer(() => new Promise(() => {})) as never}
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    // Proves the section actually rendered in this state, not just that it
    // withheld the false claim (which an early bail-out would also satisfy).
    expect(document.body.textContent).toMatch(/billing & shipping/i);
    expect(document.body.textContent).not.toMatch(/no billing address set/i);
    expect(document.body.textContent).not.toMatch(/no shipping address set/i);
  });

  it("shows a no-address message for a slot with no matching default", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={customer(async () => page([address(1)])) as never}
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/no billing address set/i);
    expect(document.body.textContent).toMatch(/no shipping address set/i);
  });

  it("still lists every saved address below the summary", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () =>
            page([
              address(1, { first_name: "Alice" }),
              address(2, { first_name: "Bob" }),
            ]),
          ) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(editButtons().length).toBeGreaterThanOrEqual(2);
  });

  // Scoped to the list's own subtree, not the whole page: the two summaries
  // above render the very addresses this asserts are absent, so a
  // document-wide match would pass whether or not the filter works.
  function savedList(): HTMLElement | null {
    const heading = [...document.querySelectorAll("h3")].find((h) =>
      /saved addresses/i.test(h.textContent ?? ""),
    );
    return (heading?.nextElementSibling as HTMLElement | null) ?? null;
  }

  it("leaves the default billing and shipping addresses out of the saved list", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () =>
            page([
              address(1, { first_name: "Billing", is_default_billing: true }),
              address(2, { first_name: "Shipping", is_default_shipping: true }),
              address(3, { first_name: "Other" }),
            ]),
          ) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    const list = savedList();
    expect(list).not.toBeNull();
    expect(list!.textContent).toMatch(/Other/);
    expect(list!.textContent).not.toMatch(/Billing/);
    expect(list!.textContent).not.toMatch(/Shipping/);
  });

  it("drops the saved-address list entirely when every address is a default", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () =>
            page([
              address(1, {
                first_name: "Only",
                is_default_billing: true,
                is_default_shipping: true,
              }),
            ]),
          ) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    // The summaries still render it; the list below has nothing left to show,
    // so its heading goes too rather than standing over an empty space.
    expect(document.body.textContent).toMatch(/Billing address/);
    expect(savedList()).toBeNull();
    expect(document.body.textContent).not.toMatch(/Saved addresses/);
  });

  it("navigates to the specific address whose own Edit button was clicked", async () => {
    const onNavigate = vi.fn();
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () =>
            page([
              address(1, { first_name: "Alice" }),
              address(2, { first_name: "Bob" }),
            ]),
          ) as never
        }
        onNavigate={onNavigate}
      />,
      {},
    );
    await flush();

    expect(editButtons().length).toBe(2);

    act(() => {
      editButtons()[0]?.click();
    });

    expect(onNavigate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: "address",
        id: "1",
        resource: expect.objectContaining({ first_name: "Alice" }),
      }),
    );

    act(() => {
      editButtons()[1]?.click();
    });

    expect(onNavigate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: "address",
        id: "2",
        resource: expect.objectContaining({ first_name: "Bob" }),
      }),
    );
  });

  it("shows an error, not an empty section, when the address read fails", async () => {
    screen = mountScreen(
      <BillingShippingSection
        customer={
          customer(async () => ({
            ok: false,
            status: 500,
            json: async () => ({}),
          })) as never
        }
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/something went wrong/i);
    expect(document.body.textContent).not.toMatch(/no billing address set/i);
    expect(document.body.textContent).not.toMatch(/no shipping address set/i);
  });

  it("shows pagination controls when there are more addresses than fit on one page", async () => {
    const addresses = Array.from({ length: 10 }, (_, index) => address(index));

    screen = mountScreen(
      <BillingShippingSection
        customer={customer(async () => page(addresses, 15)) as never}
        onNavigate={vi.fn()}
      />,
      {},
    );
    await flush();

    // The shared Pagination component renders one numbered button per page;
    // ceil(15 / 10) = 2 pages.
    const pageButtons = [...document.querySelectorAll("button")].filter((b) =>
      /^\d+$/.test(b.textContent ?? ""),
    );
    expect(pageButtons.length).toBe(2);
  });
});
