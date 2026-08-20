import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { ApiProvider, useCollection, useResource } from "./hooks";
import { RequestCache } from "./cache";

// React only allows `act` outside a test renderer when this is set, and warns
// on every update otherwise.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function render(ui: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(ui));
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

function link<T>(href: string, json: T, spy = vi.fn()) {
  return {
    href,
    get: async (query?: unknown) => {
      spy(query);
      return { json: async () => json };
    },
    patch: vi.fn(async () => ({})),
  };
}

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

describe("useResource", () => {
  it("loads through the link and exposes the resource", async () => {
    const customer = { first_name: "Ada" };
    function Probe() {
      const { data, isLoading } = useResource(link("/c", customer));
      return (
        <span data-testid="out">
          {isLoading ? "loading" : data?.first_name}
        </span>
      );
    }

    render(
      <ApiProvider api={{} as never} cache={new RequestCache()}>
        <Probe />
      </ApiProvider>,
    );
    expect(host!.textContent).toBe("loading");

    await flush();
    expect(host!.textContent).toBe("Ada");
  });

  it("renders nothing-to-load state for a null link", () => {
    function Probe() {
      const { data, isLoading } = useResource<{ x: number }>(null);
      return (
        <span>
          {String(isLoading)}:{String(data)}
        </span>
      );
    }

    render(
      <ApiProvider api={{} as never} cache={new RequestCache()}>
        <Probe />
      </ApiProvider>,
    );

    expect(host!.textContent).toBe("false:null");
  });
});

describe("useCollection", () => {
  it("exposes embedded items, total and pagination", async () => {
    const page = {
      total_items: 27,
      returned_items: 2,
      offset: 0,
      limit: 2,
      _embedded: { "fx:transactions": [{ id: 1 }, { id: 2 }] },
    };

    function Probe() {
      const { items, totalItems, isLoading } = useCollection<{ id: number }>(
        link("/t", page),
        { limit: 2 },
      );
      if (isLoading) return <span>loading</span>;
      return (
        <span>
          {items.length}/{totalItems}
        </span>
      );
    }

    render(
      <ApiProvider api={{} as never} cache={new RequestCache()}>
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("2/27");
  });

  it("passes offset and limit to get()", async () => {
    const spy = vi.fn();
    const page = { total_items: 0, _embedded: {} };

    function Probe() {
      useCollection(link("/t", page, spy), { limit: 5 });
      return null;
    }

    render(
      <ApiProvider api={{} as never} cache={new RequestCache()}>
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5, offset: 0 }),
    );
  });
});
