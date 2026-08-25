import { afterEach, describe, expect, it } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../test-utils";
import { PaymentMethod } from "./payment-method";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function link(json: unknown) {
  return {
    href: "/s/customer/default_payment_method",
    get: async () => ({ ok: true, status: 200, json: async () => json }),
  };
}

describe("PaymentMethod", () => {
  it("shows the card brand, masked number, and expiry once loaded", async () => {
    screen = mountScreen(
      <PaymentMethod
        link={
          link({
            cc_type: "visa",
            cc_number_masked: "************4242",
            cc_exp_month: "08",
            cc_exp_year: "2028",
          }) as never
        }
      />,
      {},
    );
    await flush();

    expect(screen!.host.textContent).toMatch(/visa/i);
    expect(screen!.host.textContent).toMatch(/4242/);
    expect(screen!.host.textContent).toMatch(/08\/2028/);
  });

  it("shows an empty-state message when there is no default payment method", async () => {
    screen = mountScreen(
      <PaymentMethod link={link({ cc_type: "", cc_number_masked: "" }) as never} />,
      {},
    );
    await flush();

    expect(screen!.host.textContent).toMatch(/no payment method/i);
  });

  it("shows an empty-state message when the store has no default_payment_method link", () => {
    screen = mountScreen(<PaymentMethod link={undefined} />, {});

    expect(screen!.host.textContent).toMatch(/no payment method/i);
  });

  it("shows an error alert when the read fails", async () => {
    screen = mountScreen(
      <PaymentMethod
        link={
          {
            href: "/s/customer/default_payment_method",
            get: async () => ({ ok: false, status: 500, json: async () => ({}) }),
          } as never
        }
      />,
      {},
    );
    await flush();

    expect(screen!.host.textContent).toMatch(/something went wrong/i);
  });
});
