import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "./test-utils";
import { AccountPageLayout } from "./account-page-layout";

let screen: MountedScreen | null = null;

afterEach(() => {
  screen?.unmount();
  screen = null;
});

function render(props: Record<string, unknown> = {}) {
  screen = mountScreen(
    <AccountPageLayout onBack={(props.onBack as () => void) ?? vi.fn()} {...props}>
      {(props.children as ReactNode) ?? <p>Body</p>}
    </AccountPageLayout>,
    {},
  );
}

describe("AccountPageLayout", () => {
  it("renders the title and children", () => {
    screen = mountScreen(
      <AccountPageLayout title="Edit profile" onBack={vi.fn()}>
        <p>content</p>
      </AccountPageLayout>,
      {},
    );

    expect(screen.host.textContent).toMatch(/Edit profile/);
    expect(screen.host.textContent).toMatch(/content/);
  });

  it("omits the heading when no title is given", () => {
    screen = mountScreen(
      <AccountPageLayout onBack={vi.fn()}>
        <p>content</p>
      </AccountPageLayout>,
      {},
    );

    expect(screen.host.querySelector("h1")).toBeNull();
  });

  it("calls onBack when the Back button is clicked", () => {
    const onBack = vi.fn();
    screen = mountScreen(
      <AccountPageLayout onBack={onBack}>
        <p>content</p>
      </AccountPageLayout>,
      {},
    );

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons.find((b) => /^back$/i.test(b.textContent ?? ""))!.click();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("fills the width its host gives it, setting none of its own", async () => {
    // The portal is an embeddable custom element, so page width belongs to
    // the host that embeds it. A cap here would override a merchant's own
    // layout, and there is no width a widget can pick that is right for
    // every page it lands on.
    render();
    const container = screen!.host.firstElementChild as HTMLElement;

    expect(getComputedStyle(container).maxWidth).toBe("none");

    // Widening the host has to widen the container with it, which a
    // `max-width` would silently cap. Measured rather than asserted from
    // CSS alone: `max-width: none` on a box some ancestor constrains would
    // still pass a style-only check.
    screen!.host.style.width = "1400px";
    expect(Math.round(container.getBoundingClientRect().width)).toBe(1400);
  });

  it("keeps its padding inside the width a host sets", () => {
    // border-box is still load-bearing: a shadow root gets no page-level
    // reset, so a host that *does* size the element would otherwise get that
    // width plus this padding -- the bug that made the old 960px container
    // measure 1024px.
    render();
    const container = screen!.host.firstElementChild as HTMLElement;

    expect(getComputedStyle(container).boxSizing).toBe("border-box");
  });
});
