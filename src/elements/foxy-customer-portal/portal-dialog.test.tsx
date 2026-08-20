import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "./test-utils";
import { PortalDialog } from "./portal-dialog";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

describe("PortalDialog", () => {
  it("renders its title and children when open", () => {
    screen = mountScreen(
      <PortalDialog open onOpenChange={vi.fn()} title="Edit profile">
        <p>body</p>
      </PortalDialog>,
      {},
    );

    expect(document.body.textContent).toMatch(/Edit profile/);
    expect(document.body.textContent).toMatch(/body/);
  });

  it("renders nothing when closed", () => {
    screen = mountScreen(
      <PortalDialog open={false} onOpenChange={vi.fn()} title="Edit profile">
        <p>body</p>
      </PortalDialog>,
      {},
    );

    expect(document.body.textContent).not.toMatch(/body/);
  });

  it("reports a close request", () => {
    const onOpenChange = vi.fn();

    screen = mountScreen(
      <PortalDialog open onOpenChange={onOpenChange} title="Edit profile">
        <p>body</p>
      </PortalDialog>,
      {},
    );

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
