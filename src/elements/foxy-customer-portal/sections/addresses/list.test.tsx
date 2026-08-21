import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { AddressesSection } from "./list";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const ADDRESSES_HREF = "https://demo.foxycart.com/s/customer/addresses";

function customer(get: (query?: Record<string, unknown>) => Promise<unknown>) {
  return {
    _links: {
      self: { href: "/s/customer" },
      "fx:customer_addresses": { href: ADDRESSES_HREF, get },
    },
  };
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
  patch?: (body: unknown) => Promise<{ ok: boolean; status: number }>,
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
    _links: { self: { href: `/s/${id}`, patch } },
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

function dialogInputValues(): string[] {
  return [...document.querySelectorAll<HTMLInputElement>("input")].map(
    (input) => input.value,
  );
}

describe("AddressesSection", () => {
  it("renders a loading state before the read settles", async () => {
    // Never resolves during this assertion -- catches the read mid-flight.
    screen = mountScreen(
      <AddressesSection customer={customer(() => new Promise(() => {})) as never} />,
      {},
    );

    // No address content and no error text has rendered yet, only the
    // section heading -- the loading branch, not the error or list branch.
    expect(document.body.textContent).toMatch(/Addresses/);
    expect(document.body.textContent).not.toMatch(/1 First Street/);
    expect(document.body.textContent).not.toMatch(/something went wrong/i);
  });

  it("shows an error, not an empty section, when the read fails", async () => {
    screen = mountScreen(
      <AddressesSection
        customer={
          customer(async () => ({ ok: false, status: 500, json: async () => ({}) })) as never
        }
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("renders nothing at all when there are no addresses", async () => {
    screen = mountScreen(
      <AddressesSection customer={customer(async () => page([])) as never} />,
      {},
    );
    await flush();

    expect(document.body.textContent?.trim()).toBe("");
  });

  it("lists every address it receives", async () => {
    screen = mountScreen(
      <AddressesSection
        customer={
          customer(async () => page([address(1), address(2)])) as never
        }
      />,
      {},
    );
    await flush();

    expect(editButtons().length).toBe(2);
  });

  it("opens the edit dialog for the specific address whose Edit was clicked", async () => {
    screen = mountScreen(
      <AddressesSection
        customer={
          customer(async () =>
            page([
              address(1, { first_name: "Alice", address1: "1 First Street" }),
              address(2, { first_name: "Bob", address1: "2 Second Street" }),
            ]),
          ) as never
        }
      />,
      {},
    );
    await flush();

    act(() => {
      editButtons()[1]?.click();
    });

    // Bob's (the second address's) values populate the form, not Alice's.
    const values = dialogInputValues();
    expect(values).toContain("Bob");
    expect(values).toContain("2 Second Street");
    expect(values).not.toContain("Alice");
    expect(values).not.toContain("1 First Street");
  });

  it("opens the edit dialog for the first address when its own Edit is clicked", async () => {
    screen = mountScreen(
      <AddressesSection
        customer={
          customer(async () =>
            page([
              address(1, { first_name: "Alice", address1: "1 First Street" }),
              address(2, { first_name: "Bob", address1: "2 Second Street" }),
            ]),
          ) as never
        }
      />,
      {},
    );
    await flush();

    act(() => {
      editButtons()[0]?.click();
    });

    const values = dialogInputValues();
    expect(values).toContain("Alice");
    expect(values).toContain("1 First Street");
    expect(values).not.toContain("Bob");
    expect(values).not.toContain("2 Second Street");
  });

  it("refreshes the collection after a successful save", async () => {
    const getSpy = vi.fn();
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));

    screen = mountScreen(
      <AddressesSection
        customer={
          customer(async (query) => {
            getSpy(query);
            return page([address(1, {}, patch)]);
          }) as never
        }
      />,
      {},
    );
    await flush();

    const callsBeforeSave = getSpy.mock.calls.length;

    act(() => {
      editButtons()[0]?.click();
    });

    act(() => {
      const buttons = [...document.querySelectorAll("button")];
      buttons.find((b) => /^save$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(patch).toHaveBeenCalled();
    // A successful write must invalidate the cached page so the reopened
    // dialog and the card both reflect what was actually saved, instead of
    // replaying the stale resource from before the PATCH.
    expect(getSpy.mock.calls.length).toBeGreaterThan(callsBeforeSave);
  });

  it("does not refetch when the edit dialog is dismissed without saving", async () => {
    const getSpy = vi.fn();
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));

    screen = mountScreen(
      <AddressesSection
        customer={
          customer(async (query) => {
            getSpy(query);
            return page([address(1, {}, patch)]);
          }) as never
        }
      />,
      {},
    );
    await flush();

    const callsBeforeDismiss = getSpy.mock.calls.length;

    act(() => {
      editButtons()[0]?.click();
    });

    act(() => {
      const buttons = [...document.querySelectorAll("button")];
      buttons.find((b) => /^cancel$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(patch).not.toHaveBeenCalled();
    expect(getSpy.mock.calls.length).toBe(callsBeforeDismiss);
  });

  it("hides pagination controls when everything fits on one page", async () => {
    screen = mountScreen(
      <AddressesSection
        customer={customer(async () => page([address(1)], 1)) as never}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).not.toMatch(/1[–-]1 \//);
  });

  it("shows pagination controls when there are more addresses than fit on one page", async () => {
    const addresses = Array.from({ length: 10 }, (_, index) =>
      address(index),
    );

    screen = mountScreen(
      <AddressesSection
        customer={customer(async () => page(addresses, 15)) as never}
      />,
      {},
    );
    await flush();

    expect(document.body.textContent).toMatch(/1[–-]10 \/ 15/);
  });
});
