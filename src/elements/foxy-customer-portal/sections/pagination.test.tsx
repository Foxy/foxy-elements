import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../test-utils";
import { Pagination } from "./pagination";

let screen: MountedScreen | null = null;

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

function render(props: Partial<Parameters<typeof Pagination>[0]> = {}) {
  screen = mountScreen(
    <Pagination
      offset={0}
      limit={10}
      totalItems={35}
      onGoToPage={vi.fn()}
      onPrev={vi.fn()}
      onNext={vi.fn()}
      {...props}
    />,
    {},
  );
  return screen;
}

function pageButtons(): HTMLButtonElement[] {
  return [...screen!.host.querySelectorAll<HTMLButtonElement>("button")].filter(
    (button) => /^\d+$/.test(button.textContent ?? ""),
  );
}

describe("Pagination", () => {
  it("renders one numbered button per page", () => {
    render({ totalItems: 35, limit: 10 });
    // ceil(35 / 10) = 4 pages.
    expect(pageButtons()).toHaveLength(4);
  });

  it("calls onGoToPage with the clicked page number", () => {
    const onGoToPage = vi.fn();
    render({ totalItems: 35, limit: 10, onGoToPage });

    act(() => {
      pageButtons().find((b) => b.textContent === "3")!.click();
    });

    expect(onGoToPage).toHaveBeenCalledWith(3);
  });

  it("calls onPrev when Previous is clicked", () => {
    const onPrev = vi.fn();
    render({ offset: 10, limit: 10, totalItems: 35, onPrev });

    act(() => {
      screen!.host
        .querySelectorAll("button")
        .forEach((b) => (/previous/i.test(b.textContent ?? "") ? b.click() : null));
    });

    expect(onPrev).toHaveBeenCalled();
  });

  it("calls onNext when Next is clicked", () => {
    const onNext = vi.fn();
    render({ offset: 0, limit: 10, totalItems: 35, onNext });

    act(() => {
      screen!.host
        .querySelectorAll("button")
        .forEach((b) => (/^next$/i.test(b.textContent?.trim() ?? "") ? b.click() : null));
    });

    expect(onNext).toHaveBeenCalled();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    render({ offset: 0, limit: 10, totalItems: 35 });
    const buttons = [...screen!.host.querySelectorAll("button")];
    const prev = buttons.find((b) => /previous/i.test(b.textContent ?? ""));
    expect(prev?.disabled).toBe(true);

    screen!.unmount();
    render({ offset: 30, limit: 10, totalItems: 35 });
    const buttonsLastPage = [...screen!.host.querySelectorAll("button")];
    const next = buttonsLastPage.find((b) => /^next$/i.test(b.textContent?.trim() ?? ""));
    expect(next?.disabled).toBe(true);
  });
});
