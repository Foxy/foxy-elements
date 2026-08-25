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

    expect(document.body.textContent).toMatch(/billing address/i);
    expect(document.body.textContent).toMatch(/shipping address/i);
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

  it("still lists every saved address below the summary, with a working Edit button each", async () => {
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

    expect(editButtons().length).toBeGreaterThanOrEqual(2);

    act(() => {
      editButtons()[0]?.click();
    });

    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ type: "address" }),
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
