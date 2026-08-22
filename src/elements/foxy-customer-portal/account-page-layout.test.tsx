import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "./test-utils";
import { AccountPageLayout } from "./account-page-layout";

let screen: MountedScreen | null = null;

afterEach(() => {
  screen?.unmount();
  screen = null;
});

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
});
