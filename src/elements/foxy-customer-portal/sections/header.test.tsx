import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../test-utils";
import { PortalHeader } from "./header";

let screen: MountedScreen | null = null;

function render(
  customer: Record<string, unknown>,
  props: Record<string, unknown> = {},
) {
  screen = mountScreen(
    <PortalHeader
      customer={customer as never}
      fullNameTemplate={
        (props.fullNameTemplate as string) ?? "{first_name} {last_name}"
      }
      onEditProfile={(props.onEditProfile as () => void) ?? vi.fn()}
      onSignOut={(props.onSignOut as () => void) ?? vi.fn()}
      isSigningOut={(props.isSigningOut as boolean) ?? false}
    />,
    {},
  );
}

afterEach(() => {
  screen?.unmount();
  screen = null;
});

const ada = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
  tax_id: "",
};

describe("PortalHeader", () => {
  it("renders the full name and email", () => {
    render(ada);
    expect(screen!.host.textContent).toMatch(/Ada Lovelace/);
    expect(screen!.host.textContent).toMatch(/ada@example\.com/);
  });

  it("applies a salutation template", () => {
    render(ada, { fullNameTemplate: "Dr. {first_name} {last_name}" });
    expect(screen!.host.textContent).toMatch(/Dr\. Ada Lovelace/);
  });

  it("hides the tax ID when empty", () => {
    render(ada);
    expect(screen!.host.textContent).not.toMatch(/tax id/i);
  });

  it("shows the tax ID when present", () => {
    render({ ...ada, tax_id: "GB123456789" });
    expect(screen!.host.textContent).toMatch(/GB123456789/);
  });

  it("calls onSignOut", () => {
    const onSignOut = vi.fn();
    render(ada, { onSignOut });

    act(() => {
      const buttons = [...screen!.host.querySelectorAll("button")];
      buttons
        .find((b) =>
          /sign out/i.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
        )!
        .click();
    });

    expect(onSignOut).toHaveBeenCalled();
  });

  it("disables sign out while signing out", () => {
    render(ada, { isSigningOut: true });
    const buttons = [...screen!.host.querySelectorAll("button")];
    const signOut = buttons.find((b) =>
      /sign out/i.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
    )! as HTMLButtonElement;

    expect(signOut.disabled).toBe(true);
  });
});
