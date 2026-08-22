import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ApiProvider, RequestCache } from "@/lib/customer-api";
import { useOrderById } from "./use-order-by-id";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

afterEach(() => {
  if (root) act(() => root!.unmount());
  host?.remove();
  root = null;
  host = null;
});

function renderHook(link: unknown, id: string) {
  let result: ReturnType<typeof useOrderById> | undefined;

  function Probe() {
    result = useOrderById(link as never, id);
    return null;
  }

  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);

  act(() => {
    root!.render(
      createElement(ApiProvider, {
        api: {} as never,
        cache: new RequestCache(),
        onUnauthenticated: vi.fn(),
        children: createElement(Probe),
      }),
    );
  });

  return () => result!;
}

const flush = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });

const ORDER_TYPES_FILTER =
  "type:in=transaction,subscription_modification,subscription_cancellation";

describe("useOrderById", () => {
  it("requests the same allow-listed collection every other read uses, and picks the matching id client-side", async () => {
    const spy = vi.fn(async (_query?: Record<string, unknown>) => ({
      ok: true,
      status: 200,
      json: async () => ({
        total_items: 2,
        _embedded: {
          "fx:transactions": [{ id: 1 }, { id: 98213 }],
        },
      }),
    }));

    const getResult = renderHook(
      { href: "https://demo.foxycart.com/s/customer/transactions", get: spy },
      "98213",
    );
    await flush();

    expect(getResult().order).toMatchObject({ id: 98213 });
    const [query] = spy.mock.calls.at(-1) ?? [];
    expect(query).toMatchObject({ filters: [ORDER_TYPES_FILTER], limit: 100 });
  });

  it("returns null without erroring when nothing matches", async () => {
    const getResult = renderHook(
      {
        href: "/orders",
        get: async () => ({
          ok: true,
          status: 200,
          json: async () => ({ total_items: 0, _embedded: {} }),
        }),
      },
      "missing",
    );
    await flush();

    expect(getResult().order).toBeNull();
    expect(getResult().error).toBeNull();
  });
});
