// src/elements/foxy-customer-portal/sections/addresses/card.test.tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { AddressCard, formatFullAddress, type AddressResource } from "./card";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

function address(overrides: Partial<AddressResource> = {}): AddressResource {
  return {
    address_name: "Home",
    first_name: "Jane",
    last_name: "Doe",
    company: "Acme Inc",
    phone: "555-1234",
    address1: "123 Main St",
    address2: "",
    city: "Springfield",
    region: "IL",
    postal_code: "62701",
    country: "US",
    is_default_billing: false,
    is_default_shipping: false,
    date_created: "2023-01-01T00:00:00-0700",
    date_modified: "2023-01-01T00:00:00-0700",
    _links: { self: { href: "/s/1" } },
    ...overrides,
  };
}

function render(props: Partial<Parameters<typeof AddressCard>[0]> = {}) {
  screen = mountScreen(
    <AddressCard address={address()} onEdit={() => {}} {...props} />,
    {},
  );
  return screen;
}

describe("formatFullAddress", () => {
  it("joins the non-empty parts with ', ' and skips a blank address2", () => {
    const result = formatFullAddress(
      address({ address1: "123 Main St", address2: "", city: "Springfield" }),
    );

    expect(result).not.toMatch(/,\s*,/);
    // "IL" resolves through COUNTRIES to its display name, "Illinois" --
    // this test's real point is the blank address2 leaving no double comma.
    expect(result).toBe("123 Main St, Springfield, Illinois, 62701");
  });

  it("resolves a known region code to its display name", () => {
    const result = formatFullAddress(
      address({ country: "AU", region: "NSW", city: "Sydney" }),
    );

    expect(result).toMatch(/New South Wales/);
    expect(result).not.toMatch(/\bNSW\b/);
  });

  it("falls back to the raw region value for a country with no predefined regions", () => {
    const result = formatFullAddress(
      address({ country: "AF", region: "Free-text Province" }),
    );

    expect(result).toMatch(/Free-text Province/);
  });
});

describe("AddressCard", () => {
  it("shows a Default billing badge only when is_default_billing is true", () => {
    render({ address: address({ is_default_billing: true }) });
    expect(screen!.host.textContent).toMatch(/Default billing/);
    expect(screen!.host.textContent).not.toMatch(/Default shipping/);
  });

  it("shows a Default shipping badge only when is_default_shipping is true", () => {
    render({ address: address({ is_default_shipping: true }) });
    expect(screen!.host.textContent).toMatch(/Default shipping/);
    expect(screen!.host.textContent).not.toMatch(/Default billing/);
  });

  it("shows neither badge when neither flag is true", () => {
    render({
      address: address({
        is_default_billing: false,
        is_default_shipping: false,
      }),
    });
    expect(screen!.host.textContent).not.toMatch(/Default billing/);
    expect(screen!.host.textContent).not.toMatch(/Default shipping/);
  });

  it("shows both badges simultaneously when both flags are true", () => {
    render({
      address: address({
        is_default_billing: true,
        is_default_shipping: true,
      }),
    });
    expect(screen!.host.textContent).toMatch(/Default billing/);
    expect(screen!.host.textContent).toMatch(/Default shipping/);
  });

  it("calls onEdit when the Edit button is clicked", () => {
    const onEdit = vi.fn();
    render({ onEdit });

    act(() => {
      screen!.host.querySelector("button")?.click();
    });

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  // Regression: the title falls back through address_name -> fullName ->
  // formatFullAddress(address), but a separate description line used to
  // unconditionally re-render fullName (and another unconditionally
  // re-rendered the full address), so whichever value won the title fallback
  // also showed up a second time as its own description line. See 56c7c951,
  // which fixed the same class of bug for SubscriptionCard.
  it("shows the name only once when address_name is blank and the title falls back to it", () => {
    render({
      address: address({
        address_name: "",
        first_name: "Jane",
        last_name: "Doe",
      }),
    });

    const occurrences = screen!.host.textContent!.split("Jane Doe").length - 1;
    expect(occurrences).toBe(1);
  });

  it("shows the full address only once when address_name and the name are both blank", () => {
    render({
      address: address({
        address_name: "",
        first_name: "",
        last_name: "",
      }),
    });

    const occurrences =
      screen!.host.textContent!.split("123 Main St").length - 1;
    expect(occurrences).toBe(1);
  });
});
