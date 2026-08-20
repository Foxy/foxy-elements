import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HCAPTCHA_SCRIPT_URL,
  loadHCaptcha,
  resetHCaptchaLoaderForTests,
  setHCaptchaScriptLoaderForTests,
} from "./hcaptcha";

declare global {
  interface Window {
    hcaptcha?: unknown;
  }
}

let loadCalls: string[];
let resolveLoad: (() => void) | null;
let rejectLoad: ((error: Error) => void) | null;

beforeEach(() => {
  resetHCaptchaLoaderForTests();
  loadCalls = [];
  resolveLoad = null;
  rejectLoad = null;

  // Fake script loader: no test may create a DOM node pointing at a real
  // external URL, since the `unit` project runs in real Chromium with no
  // network interception configured.
  setHCaptchaScriptLoaderForTests((src) => {
    loadCalls.push(src);
    return new Promise((resolve, reject) => {
      resolveLoad = resolve;
      rejectLoad = reject;
    });
  });
});

afterEach(() => {
  delete window.hcaptcha;
});

describe("loadHCaptcha", () => {
  it("resolves immediately when the global already exists", async () => {
    const api = { render: vi.fn(), reset: vi.fn() };
    window.hcaptcha = api;

    await expect(loadHCaptcha()).resolves.toBe(api);
    expect(loadCalls).toHaveLength(0);
  });

  it("injects the script once for concurrent callers", async () => {
    const first = loadHCaptcha();
    const second = loadHCaptcha();

    expect(loadCalls).toEqual([HCAPTCHA_SCRIPT_URL]);

    const api = { render: vi.fn(), reset: vi.fn() };
    window.hcaptcha = api;
    resolveLoad!();

    await expect(first).resolves.toBe(api);
    await expect(second).resolves.toBe(api);
  });

  it("rejects when the script fails to load", async () => {
    const pending = loadHCaptcha();
    rejectLoad!(new Error("hCaptcha failed to load."));

    await expect(pending).rejects.toThrow(/hcaptcha/i);
  });
});
