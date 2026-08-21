import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { SubscriptionCard, type SubscriptionResource } from "./card";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const DAY = 86_400_000;
const iso = (days: number) => new Date(Date.now() + days * DAY).toISOString();

function subscription(
  overrides: Partial<SubscriptionResource> = {},
): SubscriptionResource {
  return {
    frequency: "1m",
    start_date: iso(-30),
    next_transaction_date: iso(14),
    end_date: null,
    is_active: true,
    error_message: "",
    first_failed_transaction_date: null,
    _links: { self: { href: "/s/1" } },
    _embedded: {
      "fx:transaction_template": {
        currency_code: "USD",
        total_order: 42,
        _embedded: {
          "fx:items": [
            { name: "Coffee", quantity: 2 },
            { name: "Grinder", quantity: 1 },
          ],
        },
      },
    },
    ...overrides,
  } as SubscriptionResource;
}

function render(sub: SubscriptionResource, props = {}) {
  screen = mountScreen(
    <SubscriptionCard
      subscription={sub}
      onManage={vi.fn()}
      onPayments={vi.fn()}
      {...props}
    />,
    {},
  );
  return screen;
}

describe("SubscriptionCard", () => {
  it("summarises the items with their quantities", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/Coffee/);
    expect(screen!.host.textContent).toMatch(/2/);
    expect(screen!.host.textContent).toMatch(/Grinder/);
  });

  it("shows the price in the transaction template's currency", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/\$42/);
  });

  it("shows the status", () => {
    render(subscription());
    expect(screen!.host.textContent).toMatch(/active/i);
  });

  it("shows an error message when the subscription has one", () => {
    render(subscription({ error_message: "Card declined." }));
    expect(screen!.host.textContent).toMatch(/Card declined\./);
  });

  it("shows no error text when there is none", () => {
    render(subscription());
    expect(screen!.host.textContent).not.toMatch(/declined/i);
  });

  it("calls onManage", () => {
    const onManage = vi.fn();
    render(subscription(), { onManage });

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /manage/i.test(b.textContent ?? ""))!.click();
    });

    expect(onManage).toHaveBeenCalled();
  });

  it("calls onPayments", () => {
    const onPayments = vi.fn();
    render(subscription(), { onPayments });

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /payments/i.test(b.textContent ?? ""))!.click();
    });

    expect(onPayments).toHaveBeenCalled();
  });
});
