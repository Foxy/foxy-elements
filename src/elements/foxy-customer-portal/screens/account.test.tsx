import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../test-utils";
import { AccountScreen } from "./account";

let screen: MountedScreen | null = null;

afterEach(() => {
  screen?.unmount();
  screen = null;
});

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

function render(get: () => Promise<unknown>) {
  screen = mountScreen(
    <AccountScreen
      onSignedOut={vi.fn()}
      settings={null}
      accountPage={{ type: "home" }}
      variant="subscriptions"
      onNavigate={vi.fn()}
    />,
    { base: new URL("https://demo.foxycart.com/s/customer/"), get },
  );
}

/** The home page's own wrapper: the one element that pads the page. */
function pageWrapper(): HTMLElement {
  return screen!.host.firstElementChild as HTMLElement;
}

describe("AccountScreen home", () => {
  it("shows the loading state inside the padded page", async () => {
    render(() => new Promise(() => {}));
    await flush();

    expect(getComputedStyle(pageWrapper()).paddingTop).toBe("48px");
    expect(pageWrapper().textContent).not.toMatch(/try again/i);
    // A Skeleton has no size of its own; the placeholder must show something.
    expect(pageWrapper().getBoundingClientRect().height).toBeGreaterThan(300);
  });

  it("shows the error state inside the padded page", async () => {
    render(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    await flush();

    expect(pageWrapper().textContent).toMatch(/try again/i);
    expect(getComputedStyle(pageWrapper()).paddingTop).toBe("48px");
  });
});
