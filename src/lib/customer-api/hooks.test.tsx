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

/**
 * A link double shaped like the real client: `patch` resolves with a response
 * carrying `ok` and `status`, never rejects. The SDK's `AuthError` is thrown
 * only by `signIn`, `signUp`, `sendPasswordResetEmail` and `signOut`; a link's
 * `patch` reports failure through the status alone.
 */
function link<T>(href: string, json: T, spy = vi.fn()) {
  return {
    href,
    get: async (query?: unknown) => {
      spy(query);
      return { ok: true, status: 200, json: async () => json };
    },
    patch: vi.fn(async () => ({ ok: true, status: 200 })),
  };
}

function failingLink<T>(href: string, json: T, status: number) {
  return {
    href,
    get: async () => ({ ok: true, status: 200, json: async () => json }),
    patch: vi.fn(async () => ({ ok: false, status })),
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
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
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
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );

    expect(host!.textContent).toBe("false:null");
  });

  it("exposes the failure when the load rejects", async () => {
    const broken = {
      href: "/c",
      get: async () => {
        throw new Error("boom");
      },
    };

    function Probe() {
      const { error, isLoading } = useResource<{ x: number }>(broken);
      if (isLoading) return <span>loading</span>;
      return <span>{error?.message}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("boom");
  });

  it("re-reads the resource after refresh()", async () => {
    let name = "Ada";
    const target = {
      href: "/c",
      get: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ first_name: name }),
      }),
    };

    let refresh = () => {};

    function Probe() {
      const resource = useResource(target);
      refresh = resource.refresh;
      return <span>{resource.data?.first_name ?? "loading"}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();
    expect(host!.textContent).toBe("Ada");

    name = "Augusta";
    act(() => refresh());
    await flush();

    expect(host!.textContent).toBe("Augusta");
  });

  it("patches through the link and re-reads the resource", async () => {
    const target = link("/c", { first_name: "Ada" });
    let patch: (body: { first_name: string }) => Promise<void> = async () => {};

    function Probe() {
      const resource = useResource(target);
      patch = resource.patch;
      return <span>{resource.data?.first_name ?? "loading"}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    await act(async () => {
      await patch({ first_name: "Augusta" });
    });

    expect(target.patch).toHaveBeenCalledWith({ first_name: "Augusta" });
  });

  it("rejects when the API refuses the patch", async () => {
    // The SDK resolves on a 4xx, so a hook that only awaited the call would
    // report this rejected write as a save.
    const target = failingLink("/c", { first_name: "Ada" }, 401);
    let patch: (body: { first_name: string }) => Promise<void> = async () => {};

    function Probe() {
      patch = useResource(target).patch;
      return null;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    await expect(patch({ first_name: "Augusta" })).rejects.toMatchObject({
      status: 401,
    });
  });

  it("rejects a patch on a link that cannot be written to", async () => {
    let patch: (body: { x: number }) => Promise<void> = async () => {};

    function Probe() {
      patch = useResource({
        href: "/c",
        get: async () => ({
          ok: true,
          status: 200,
          json: async () => ({ x: 1 }),
        }),
      }).patch;
      return null;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    await expect(patch({ x: 2 })).rejects.toThrow(/not writable/i);
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
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
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
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5, offset: 0 }),
    );
  });

  it("exposes the failure when the page fails to load", async () => {
    const broken = {
      href: "/t",
      get: async () => {
        throw new Error("boom");
      },
    };

    function Probe() {
      const { error, isLoading, items } = useCollection<{ id: number }>(broken);
      if (isLoading) return <span>loading</span>;
      return (
        <span>
          {error?.message}:{items.length}
        </span>
      );
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("boom:0");
  });

  it("does not publish the raw HAL page", async () => {
    const page = {
      total_items: 1,
      _embedded: { "fx:transactions": [{ id: 1 }] },
    };
    let result: Record<string, unknown> = {};

    function Probe() {
      result = useCollection<{ id: number }>(link("/t", page)) as never;
      return null;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(result).not.toHaveProperty("data");
  });

  it("re-reads the page after refresh()", async () => {
    let total = 1;
    const target = {
      href: "/t",
      get: async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          total_items: total,
          _embedded: { "fx:transactions": [{ id: 1 }] },
        }),
      }),
    };

    let refresh = () => {};

    function Probe() {
      const collection = useCollection<{ id: number }>(target);
      refresh = collection.refresh;
      return (
        <span>{collection.isLoading ? "loading" : collection.totalItems}</span>
      );
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();
    expect(host!.textContent).toBe("1");

    total = 9;
    act(() => refresh());
    await flush();

    expect(host!.textContent).toBe("9");
  });
});

describe("useCollection offset", () => {
  it("returns to the first page when the link changes", async () => {
    const page = {
      total_items: 100,
      _embedded: { "fx:subscriptions": [{ id: 1 }] },
    };

    const activeSpy = vi.fn() as any;
    const inactiveSpy = vi.fn() as any;

    function Probe({ href, spy }: { href: string; spy: any }) {
      const { offset, loadNext } = useCollection<{ id: number }>(
        link(href, page, spy),
        { limit: 20 },
      );

      return (
        <button type="button" onClick={loadNext}>
          {offset}
        </button>
      );
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe href="/subscriptions?is_active=true" spy={activeSpy} />
      </ApiProvider>,
    );
    await flush();

    act(() => host!.querySelector("button")!.click());
    await flush();
    expect(host!.textContent).toBe("20");

    // Same component, different collection — the offset belongs to the old one.
    act(() =>
      root!.render(
        <ApiProvider
          api={{} as never}
          cache={new RequestCache()}
          onUnauthenticated={() => {}}
        >
          <Probe href="/subscriptions?is_active=false" spy={inactiveSpy} />
        </ApiProvider>,
      ),
    );
    await flush();

    expect(host!.textContent).toBe("0");

    // The displayed number is not enough. A naive fix that corrects the state
    // after the fact still lets this render fire a request for the stale page
    // first, so assert on what was actually requested: every call for the new
    // collection must ask for offset 0.
    expect(inactiveSpy).toHaveBeenCalled();
    for (const [query] of inactiveSpy.mock.calls) {
      expect(query).toMatchObject({ offset: 0 });
    }
  });

  it("keeps the offset when the link is unchanged", async () => {
    const page = { total_items: 100, _embedded: { "fx:x": [{ id: 1 }] } };

    function Probe() {
      const { offset, loadNext } = useCollection<{ id: number }>(
        link("/same", page),
        { limit: 20 },
      );

      return (
        <button type="button" onClick={loadNext}>
          {offset}
        </button>
      );
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    act(() => host!.querySelector("button")!.click());
    await flush();
    expect(host!.textContent).toBe("20");

    // A re-render with an equal href must not throw the customer back to page 1.
    act(() =>
      root!.render(
        <ApiProvider
          api={{} as never}
          cache={new RequestCache()}
          onUnauthenticated={() => {}}
        >
          <Probe />
        </ApiProvider>,
      ),
    );
    await flush();

    expect(host!.textContent).toBe("20");
  });

  it("returns to the first page when only the query changes, same href", async () => {
    const page = {
      total_items: 100,
      _embedded: { "fx:subscriptions": [{ id: 1 }] },
    };

    const activeSpy = vi.fn() as any;
    const inactiveSpy = vi.fn() as any;

    // Same link object every render — only `filters` changes, exactly like
    // FX-275's Active/Inactive toggle, which keeps `fx:subscriptions` and
    // swaps the query instead of the href.
    const sharedLink = link("/subscriptions", page, activeSpy);

    function Probe({
      filters,
      spy,
    }: {
      filters: string;
      spy: (query?: unknown) => void;
    }) {
      const { offset, loadNext } = useCollection<{ id: number }>(
        {
          ...sharedLink,
          get: async (query?: unknown) => {
            spy(query);
            return sharedLink.get(query);
          },
        },
        { limit: 20, filters: [filters] },
      );

      return (
        <button type="button" onClick={loadNext}>
          {offset}
        </button>
      );
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe filters="is_active=true" spy={activeSpy} />
      </ApiProvider>,
    );
    await flush();

    act(() => host!.querySelector("button")!.click());
    await flush();
    expect(host!.textContent).toBe("20");

    // Same href, same component — only the query's `filters` changes.
    act(() =>
      root!.render(
        <ApiProvider
          api={{} as never}
          cache={new RequestCache()}
          onUnauthenticated={() => {}}
        >
          <Probe filters="is_active=false" spy={inactiveSpy} />
        </ApiProvider>,
      ),
    );
    await flush();

    expect(host!.textContent).toBe("0");

    // The displayed number is not enough: a fix that only corrects state
    // after the fact would still let this render fire one stale request at
    // the old offset before the correction lands. Assert on what every
    // request for the new filters actually asked for.
    expect(inactiveSpy).toHaveBeenCalled();
    for (const [query] of inactiveSpy.mock.calls) {
      expect(query).toMatchObject({ offset: 0 });
    }
  });
});

describe("useResource read guards", () => {
  function failingLink(status: number) {
    return {
      href: "/c",
      get: async () => ({
        ok: false,
        status,
        json: async () => ({ first_name: "leaked" }),
      }),
    };
  }

  it("surfaces UnauthenticatedError on a 401 instead of the parsed body", async () => {
    function Probe() {
      const { data, error } = useResource<{ first_name: string }>(
        failingLink(401),
      );
      if (error) return <span>{error.name}</span>;
      return <span>{data?.first_name ?? "loading"}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("UnauthenticatedError");
  });

  it("surfaces a plain error on other failures", async () => {
    function Probe() {
      const { error } = useResource<{ first_name: string }>(failingLink(500));
      return <span>{error ? error.name : "none"}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("Error");
  });
});

describe("routing an expired session back to sign-in", () => {
  function failingLink(status: number) {
    return {
      href: "/c",
      get: async () => ({
        ok: false,
        status,
        json: async () => ({}) as never,
      }),
    };
  }

  function failingCollectionLink(status: number) {
    return {
      href: "/t",
      get: async () => ({
        ok: false,
        status,
        json: async () => ({}) as never,
      }),
    };
  }

  it("fires onUnauthenticated when useResource's read is unauthenticated", async () => {
    const onUnauthenticated = vi.fn();

    function Probe() {
      useResource<{ x: number }>(failingLink(401));
      return null;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={onUnauthenticated}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("fires onUnauthenticated when useCollection's read is unauthenticated", async () => {
    const onUnauthenticated = vi.fn();

    function Probe() {
      useCollection<{ id: number }>(failingCollectionLink(403));
      return null;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={onUnauthenticated}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("does not fire onUnauthenticated for a non-auth failure", async () => {
    const onUnauthenticated = vi.fn();

    function Probe() {
      useResource<{ x: number }>(failingLink(500));
      return null;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={onUnauthenticated}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("does not re-fire on repeated renders with the same error", async () => {
    const onUnauthenticated = vi.fn();
    const target = failingLink(401);
    // Same `api`/`cache` across every render below, on purpose: a fresh
    // `RequestCache` per render would reset the entry to IDLE and manufacture
    // a spurious true->false->true transition that has nothing to do with
    // the thing under test — whether one *stable* rejected entry re-fires.
    const api = {} as never;
    const cache = new RequestCache();

    function Probe({ tick }: { tick: number }) {
      useResource<{ x: number }>(target);
      return <span>{tick}</span>;
    }

    render(
      <ApiProvider
        api={api}
        cache={cache}
        onUnauthenticated={onUnauthenticated}
      >
        <Probe tick={0} />
      </ApiProvider>,
    );
    await flush();
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);

    // Three more commits with the same still-unauthenticated error must not
    // fire it again — a routing callback that fires per render would loop
    // the moment the parent it drives (a screen switch) re-renders anything
    // downstream.
    for (let tick = 1; tick <= 3; tick++) {
      act(() =>
        root!.render(
          <ApiProvider
            api={api}
            cache={cache}
            onUnauthenticated={onUnauthenticated}
          >
            <Probe tick={tick} />
          </ApiProvider>,
        ),
      );
      await flush();
    }

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("exposes isUnauthenticated from useResource so consumers can suppress error UI", async () => {
    function Probe() {
      const { isUnauthenticated } = useResource<{ x: number }>(
        failingLink(401),
      );
      return <span>{String(isUnauthenticated)}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("true");
  });

  it("exposes isUnauthenticated from useCollection so consumers can suppress error UI", async () => {
    function Probe() {
      const { isUnauthenticated } = useCollection<{ id: number }>(
        failingCollectionLink(401),
      );
      return <span>{String(isUnauthenticated)}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={() => {}}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(host!.textContent).toBe("true");
  });

  it("does not route to sign-in for a resource opted out of session routing", async () => {
    // `customer_portal_settings` (view.tsx's `useSettingsLink`) is public and
    // unauthenticated -- a 401/403 from it says nothing about the customer's
    // session, and must not clear storage or bounce every screen (including
    // sign-in, where it's also fetched) back to sign-in.
    const onUnauthenticated = vi.fn();

    function Probe() {
      const { isUnauthenticated } = useResource<{ x: number }>(
        failingLink(401),
        undefined,
        { skipUnauthenticatedRouting: true },
      );
      return <span>{String(isUnauthenticated)}</span>;
    }

    render(
      <ApiProvider
        api={{} as never}
        cache={new RequestCache()}
        onUnauthenticated={onUnauthenticated}
      >
        <Probe />
      </ApiProvider>,
    );
    await flush();

    expect(onUnauthenticated).not.toHaveBeenCalled();
    // The error itself is still surfaced -- only the routing is suppressed.
    expect(host!.textContent).toBe("true");
  });
});
