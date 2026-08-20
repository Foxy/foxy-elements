import { beforeEach, describe, expect, it } from "vitest";
import {
  MemoryStorage,
  ScopedStorage,
  createScopedStorage,
} from "./scoped-storage";

describe("ScopedStorage", () => {
  beforeEach(() => localStorage.clear());

  it("namespaces keys by scope", () => {
    new ScopedStorage("https://a.foxycart.com/s/customer/").setItem(
      "session",
      "A",
    );
    expect(
      localStorage.getItem("foxy:https://a.foxycart.com/s/customer/:session"),
    ).toBe("A");
  });

  it("keeps two stores on one domain apart", () => {
    const a = new ScopedStorage("https://a.foxycart.com/s/customer/");
    const b = new ScopedStorage("https://b.foxycart.com/s/customer/");

    a.setItem("session", "A");
    b.setItem("session", "B");

    expect(a.getItem("session")).toBe("A");
    expect(b.getItem("session")).toBe("B");
  });

  it("returns null for a missing key", () => {
    expect(new ScopedStorage("s").getItem("nope")).toBeNull();
  });

  it("removes only its own key", () => {
    const a = new ScopedStorage("a");
    const b = new ScopedStorage("b");
    a.setItem("session", "A");
    b.setItem("session", "B");

    a.removeItem("session");

    expect(a.getItem("session")).toBeNull();
    expect(b.getItem("session")).toBe("B");
  });

  it("clear() removes only this scope's keys", () => {
    const a = new ScopedStorage("a");
    const b = new ScopedStorage("b");
    a.setItem("session", "A");
    a.setItem("other", "A2");
    b.setItem("session", "B");

    a.clear();

    expect(a.length).toBe(0);
    expect(b.getItem("session")).toBe("B");
  });

  it("exposes length and key() over its own scope only", () => {
    const a = new ScopedStorage("a");
    new ScopedStorage("b").setItem("session", "B");
    a.setItem("session", "A");

    expect(a.length).toBe(1);
    expect(a.key(0)).toBe("session");
    expect(a.key(1)).toBeNull();
  });
});

describe("MemoryStorage", () => {
  it("round-trips values without touching localStorage", () => {
    const storage = new MemoryStorage();
    storage.setItem("session", "A");

    expect(storage.getItem("session")).toBe("A");
    expect(storage.length).toBe(1);
    expect(storage.key(0)).toBe("session");
    expect(localStorage.getItem("session")).toBeNull();

    storage.removeItem("session");
    expect(storage.getItem("session")).toBeNull();

    storage.setItem("a", "1");
    storage.clear();
    expect(storage.length).toBe(0);
  });
});

describe("createScopedStorage", () => {
  beforeEach(() => localStorage.clear());

  it("uses localStorage when it works", () => {
    createScopedStorage("https://a.foxycart.com/s/customer/").setItem(
      "session",
      "A",
    );

    expect(
      localStorage.getItem("foxy:https://a.foxycart.com/s/customer/:session"),
    ).toBe("A");
  });

  it("falls back to memory when the browser blocks storage", () => {
    // What a third-party iframe or a cookie-blocking mode does: reading the
    // property itself throws, before any key is touched.
    const descriptor = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    ) as PropertyDescriptor;

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });

    try {
      const storage = createScopedStorage("https://a.foxycart.com/s/customer/");
      storage.setItem("session", "A");
      expect(storage.getItem("session")).toBe("A");
    } finally {
      Object.defineProperty(window, "localStorage", descriptor);
    }
  });

  it("falls back to memory when writes throw, not just reads", () => {
    const backing = window.localStorage;
    const setItem = backing.setItem.bind(backing);

    backing.setItem = () => {
      throw new DOMException("Quota exceeded.", "QuotaExceededError");
    };

    try {
      const storage = createScopedStorage("https://a.foxycart.com/s/customer/");
      storage.setItem("session", "A");
      expect(storage.getItem("session")).toBe("A");
    } finally {
      backing.setItem = setItem;
    }
  });
});
