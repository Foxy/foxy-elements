import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { ManageDialog } from "./manage-dialog";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

const SETTINGS = {
  subscriptions: {
    allow_frequency_modification: [
      { jsonata_query: "*", values: ["1m", "2m", "1y"] },
    ],
    allow_next_date_modification: true,
  },
};

function subscription(
  overrides = {},
  patch = vi.fn(async () => ({ ok: true, status: 200 })),
) {
  return {
    frequency: "1m",
    // Offset-carrying with a late time-of-day, not UTC midnight -- the shape
    // the API actually sends. See the "shows the store's calendar day..."
    // tests below for why this matters.
    start_date: "2026-01-01T22:45:01-0700",
    next_transaction_date: "2099-01-01T00:00:00Z",
    end_date: null,
    is_active: true,
    error_message: "",
    first_failed_transaction_date: null,
    _links: {
      self: { href: "/s/1", patch },
      "fx:sub_token_url": {
        href: "https://demo.foxycart.com/cart?sub_token=x",
      },
      "fx:sub_modification_url": {
        href: "https://demo.foxycart.com/cart?mod=x",
      },
    },
    ...overrides,
  };
}

function render(
  sub = subscription(),
  settings: unknown = SETTINGS,
  onClose = vi.fn(),
) {
  screen = mountScreen(
    <ManageDialog
      subscription={sub as never}
      settings={settings as never}
      open
      onClose={onClose}
    />,
    {},
  );
  return screen;
}

function links() {
  return [...document.querySelectorAll("a")];
}

describe("ManageDialog", () => {
  it("links out to cancel with the cancel flag", () => {
    render();
    const cancel = links().find((a) => /cancel/i.test(a.textContent ?? ""));
    expect(cancel?.href).toMatch(/sub_cancel=true/);
  });

  it("links out to modify items", () => {
    render();
    const modify = links().find((a) => /modify/i.test(a.textContent ?? ""));
    expect(modify?.href).toMatch(/mod=x/);
  });

  it("links out to update billing with the checkout flags", () => {
    render();
    const billing = links().find((a) => /billing/i.test(a.textContent ?? ""));
    expect(billing?.href).toMatch(/cart=checkout/);
    expect(billing?.href).toMatch(/sub_restart=auto/);
  });

  it("shows the read-only details", () => {
    render();

    // The customer-scoped subscription resource has no `id` prop — only
    // `third_party_id`, which is for external systems. The id shown here comes
    // from the self link's last path segment.
    expect(document.body.textContent).toMatch(/\b1\b/);
    expect(document.body.textContent).toMatch(/started/i);
  });

  it("shows an end date only when the subscription has one", () => {
    render();
    expect(document.body.textContent).not.toMatch(/ends/i);

    act(() => screen?.unmount());
    render(subscription({ end_date: "2099-06-01T00:00:00Z" }));
    expect(document.body.textContent).toMatch(/ends/i);
  });

  it("shows the store's calendar day for the start date, not the viewer's UTC-shifted one", () => {
    // Same shift as the payments dialog: an offset-carrying timestamp late
    // in the store's day rolls forward to the next day for a viewer at or
    // east of the store's timezone if parsed and formatted naively.
    render(subscription({ start_date: "2023-02-11T22:45:01-0700" }));
    expect(document.body.textContent).toMatch(/Feb 11, 2023/);
    expect(document.body.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("shows the store's calendar day for the end date, not the viewer's UTC-shifted one", () => {
    render(subscription({ end_date: "2023-02-11T22:45:01-0700" }));
    expect(document.body.textContent).toMatch(/Feb 11, 2023/);
    expect(document.body.textContent).not.toMatch(/Feb 12, 2023/);
  });

  it("offers only the frequencies the store allows", () => {
    render();

    // Base UI renders the Select's options only once the popup is open, so the
    // trigger has to be clicked first — asserting against a closed Select
    // would pass for the wrong reason.
    act(() => {
      document
        .querySelector<HTMLElement>(
          '[role="combobox"], [aria-haspopup="listbox"]',
        )
        ?.click();
    });

    const options = [...document.querySelectorAll('[role="option"]')].map(
      (o) => o.textContent,
    );

    expect(options.length).toBeGreaterThan(0);
    // The store's rule allows 1m, 2m and 1y. A fourth value must not appear.
    expect(options.join(" ")).toMatch(/1m/);
    expect(options.join(" ")).toMatch(/1y/);
    expect(options.join(" ")).not.toMatch(/3w/);
  });

  it("hides the frequency control when the store allows no changes", () => {
    render(subscription(), {
      subscriptions: {
        allow_frequency_modification: [{ jsonata_query: "*", values: [] }],
        allow_next_date_modification: true,
      },
    });

    expect(document.body.textContent).not.toMatch(/frequency/i);
  });

  it("saves a changed frequency through patchResource", async () => {
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    render(subscription({}, patch));

    act(() => {
      const buttons = [...document.querySelectorAll("button")];
      buttons.find((b) => /^save$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(patch).toHaveBeenCalledWith(
      expect.objectContaining({ frequency: expect.any(String) }),
    );
  });

  it("stays open and shows an error when the save is rejected", async () => {
    const patch = vi.fn(async () => ({ ok: false, status: 422 }));
    const onClose = vi.fn();
    render(subscription({}, patch), SETTINGS, onClose);

    act(() => {
      const buttons = [...document.querySelectorAll("button")];
      buttons.find((b) => /^save$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.textContent).toMatch(/something went wrong/i);
  });

  it("disables the link-outs once the subscription has ended", () => {
    render(subscription({ end_date: "2020-01-01T00:00:00Z" }));

    for (const anchor of links()) {
      expect(anchor.getAttribute("aria-disabled")).toBe("true");
    }
  });
});

describe("ManageDialog next payment date", () => {
  it("hides the date control when the store forbids changes", () => {
    render(subscription(), {
      subscriptions: {
        allow_frequency_modification: [{ jsonata_query: "*", values: ["1m"] }],
        allow_next_date_modification: false,
      },
    });

    expect(document.body.textContent).not.toMatch(/next payment date/i);
  });

  it("shows the date control when the store allows any date", () => {
    render(subscription(), {
      subscriptions: {
        allow_frequency_modification: [{ jsonata_query: "*", values: ["1m"] }],
        allow_next_date_modification: true,
      },
    });

    expect(document.body.textContent).toMatch(/next payment date/i);
  });

  it("saves a changed date through patchResource", async () => {
    const patch = vi.fn(async () => ({ ok: true, status: 200 }));
    render(subscription({}, patch));

    // Pick any enabled day cell the picker rendered.
    act(() => {
      const day = document.querySelector<HTMLButtonElement>(
        "button[data-day]:not([disabled])",
      );
      day?.click();
    });

    act(() => {
      const buttons = [...document.querySelectorAll("button")];
      buttons.find((b) => /^save$/i.test(b.textContent ?? ""))!.click();
    });
    await flush();

    expect(patch).toHaveBeenCalledWith(
      expect.objectContaining({ next_transaction_date: expect.any(String) }),
    );
  });

  it("sends the local calendar day the customer clicked, not a UTC-shifted neighbour", async () => {
    // Fixing "now" pins the month DayPicker shows by default (it defaults to
    // today when nothing is selected), so the test can target a specific,
    // known day instead of an arbitrary one and assert an exact value —
    // `expect.any(String)` above would not have caught a date that shifted a
    // day east of UTC.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 2, 1)); // March 1, 2026, local midnight.

    try {
      const patch = vi.fn(async () => ({ ok: true, status: 200 }));
      render(subscription({}, patch));

      act(() => {
        // `data-outside` is always present (React renders custom data-*
        // attributes literally, even when `false`), so its value has to be
        // compared rather than treated as a presence flag.
        const day = [
          ...document.querySelectorAll<HTMLButtonElement>("button[data-day]"),
        ].find(
          (b) =>
            b.textContent === "15" &&
            !b.disabled &&
            b.getAttribute("data-outside") !== "true",
        );
        day?.click();
      });

      act(() => {
        const buttons = [...document.querySelectorAll("button")];
        buttons.find((b) => /^save$/i.test(b.textContent ?? ""))!.click();
      });
      await flush();

      expect(patch).toHaveBeenCalledWith(
        expect.objectContaining({ next_transaction_date: "2026-03-15" }),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
