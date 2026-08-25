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

// `aria-hidden="true"` alone would also match the Previous/Next chevron
// icons, so scope to the non-button ellipsis spans specifically.
function ellipsisSpans(): Element[] {
  return [...screen!.host.querySelectorAll('span[aria-hidden="true"]')];
}

describe("Pagination", () => {
  // Previous/Next are design-system Buttons while the numbered ones are local;
  // left at the default size they stood 8px taller than the row they sit in.
  it("sizes Previous and Next to match the numbered buttons", () => {
    render({ offset: 10, limit: 10, totalItems: 35 });

    const buttons = [...screen!.host.querySelectorAll("button")];
    const prev = buttons.find((b) => /previous/i.test(b.textContent ?? ""))!;
    const next = buttons.find((b) =>
      /^next/i.test((b.textContent ?? "").trim()),
    )!;

    // Their slots are hidden below 640px and the test viewport is narrower,
    // which would measure both at zero. Overriding display on the slots only
    // makes them measurable; it does not touch the button's own height, which
    // is what this asserts.
    prev.parentElement!.style.display = "block";
    next.parentElement!.style.display = "block";

    const height = (el: Element) =>
      Math.round(el.getBoundingClientRect().height);

    const numbered = height(pageButtons()[0]);
    expect(numbered).toBeGreaterThan(0);
    expect(height(prev)).toBe(numbered);
    expect(height(next)).toBe(numbered);
  });

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

  it("windows large page counts behind an ellipsis instead of rendering one button per page", () => {
    // 50 pages total, well above the 7-page threshold where windowing kicks in.
    render({ offset: 0, limit: 10, totalItems: 500 });

    const buttons = pageButtons();
    // First page, current page and its neighbour, and the last page --
    // never anywhere close to one button per page.
    expect(buttons.length).toBeLessThanOrEqual(6);

    const ellipses = ellipsisSpans();
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it("does not window page counts at or below the threshold", () => {
    render({ offset: 0, limit: 10, totalItems: 35 });

    expect(pageButtons()).toHaveLength(4);
    expect(ellipsisSpans()).toHaveLength(0);
  });

  it("marks the current page with aria-current", () => {
    render({ offset: 20, limit: 10, totalItems: 35 });

    const current = pageButtons().find((b) => b.textContent === "3");
    expect(current?.getAttribute("aria-current")).toBe("page");

    const other = pageButtons().find((b) => b.textContent === "1");
    expect(other?.hasAttribute("aria-current")).toBe(false);
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
