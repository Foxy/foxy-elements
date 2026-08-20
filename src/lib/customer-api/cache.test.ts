import { describe, expect, it, vi } from "vitest";
import { RequestCache, serialiseQuery } from "./cache";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("serialiseQuery", () => {
  it("is stable across key order", () => {
    expect(serialiseQuery({ limit: 20, zoom: "items" })).toBe(
      serialiseQuery({ zoom: "items", limit: 20 }),
    );
  });

  it("distinguishes different values", () => {
    expect(serialiseQuery({ limit: 20 })).not.toBe(
      serialiseQuery({ limit: 40 }),
    );
  });

  it("treats undefined as empty", () => {
    expect(serialiseQuery(undefined)).toBe("");
  });
});

describe("RequestCache", () => {
  it("returns a loading entry on first read and starts the load once", async () => {
    const cache = new RequestCache();
    const load = vi.fn(async () => "value");

    expect(cache.read("k", load)).toEqual({
      data: null,
      error: null,
      isLoading: true,
    });
    cache.read("k", load);
    await flush();

    expect(load).toHaveBeenCalledTimes(1);
    expect(cache.read("k", load)).toEqual({
      data: "value",
      error: null,
      isLoading: false,
    });
  });

  it("notifies subscribers when a load settles", async () => {
    const cache = new RequestCache();
    const listener = vi.fn();

    cache.subscribe("k", listener);
    cache.read("k", async () => "value");
    await flush();

    expect(listener).toHaveBeenCalled();
  });

  it("stores the error and stops loading when the load rejects", async () => {
    const cache = new RequestCache();
    const boom = new Error("boom");

    cache.read("k", async () => {
      throw boom;
    });
    await flush();

    expect(cache.read("k", async () => "unused")).toEqual({
      data: null,
      error: boom,
      isLoading: false,
    });
  });

  it("re-loads after invalidate", async () => {
    const cache = new RequestCache();
    const load = vi.fn(async () => "value");

    cache.read("k", load);
    await flush();
    cache.invalidate("k");
    cache.read("k", load);
    await flush();

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("stops notifying after unsubscribe", async () => {
    const cache = new RequestCache();
    const listener = vi.fn();

    cache.subscribe("k", listener)();
    cache.read("k", async () => "value");
    await flush();

    expect(listener).not.toHaveBeenCalled();
  });

  it("does not clobber fresh value with stale load that settles late", async () => {
    const cache = new RequestCache();
    const delay = (ms: number, value: string) =>
      new Promise((resolve) => setTimeout(() => resolve(value), ms));

    const loadA = vi.fn(async () => delay(50, "STALE-A"));
    const loadB = vi.fn(async () => delay(10, "FRESH-B"));

    cache.read("k", loadA);
    cache.invalidate("k");
    cache.read("k", loadB);
    await delay(100, undefined);

    expect(cache.read("k", async () => "unused")).toEqual({
      data: "FRESH-B",
      error: null,
      isLoading: false,
    });
  });
});
