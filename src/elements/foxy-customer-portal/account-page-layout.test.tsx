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

    expect(screen.host.querySelector("h2")).toBeNull();
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

  it("constrains the page and centres it", () => {
    render();
    const container = screen!.host.firstElementChild as HTMLElement;
    const styles = getComputedStyle(container);

    expect(styles.maxWidth).toBe("960px");
    expect(styles.boxSizing).toBe("border-box");
    // border-box, so the padding is inside the max-width rather than added
    // to it -- a shadow root gets no page-level reset to do this for us.
    expect(container.getBoundingClientRect().width).toBeLessThanOrEqual(960);
  });

  it("takes a wider column when a page asks for one", () => {
    render({ maxWidth: "1080px" });
    const container = screen!.host.firstElementChild as HTMLElement;

    expect(getComputedStyle(container).maxWidth).toBe("1080px");
  });
});
