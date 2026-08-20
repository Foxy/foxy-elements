import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HCAPTCHA_SCRIPT_URL,
  loadHCaptcha,
  resetHCaptchaLoaderForTests,
} from "./hcaptcha";

declare global {
  interface Window {
    hcaptcha?: unknown;
  }
}

beforeEach(() => resetHCaptchaLoaderForTests());

afterEach(() => {
  delete window.hcaptcha;
  document
    .querySelectorAll(`script[src="${HCAPTCHA_SCRIPT_URL}"]`)
    .forEach((n) => n.remove());
});

describe("loadHCaptcha", () => {
  it("resolves immediately when the global already exists", async () => {
    const api = { render: vi.fn(), reset: vi.fn() };
    window.hcaptcha = api;

    await expect(loadHCaptcha()).resolves.toBe(api);
    expect(
      document.querySelector(`script[src="${HCAPTCHA_SCRIPT_URL}"]`),
    ).toBeNull();
  });

  it("injects the script once for concurrent callers", async () => {
    const first = loadHCaptcha();
    const second = loadHCaptcha();

    expect(
      document.querySelectorAll(`script[src="${HCAPTCHA_SCRIPT_URL}"]`),
    ).toHaveLength(1);

    const api = { render: vi.fn(), reset: vi.fn() };
    window.hcaptcha = api;
    document
      .querySelector(`script[src="${HCAPTCHA_SCRIPT_URL}"]`)!
      .dispatchEvent(new Event("load"));

    await expect(first).resolves.toBe(api);
    await expect(second).resolves.toBe(api);
  });

  it("rejects when the script fails to load", async () => {
    const pending = loadHCaptcha();
    document
      .querySelector(`script[src="${HCAPTCHA_SCRIPT_URL}"]`)!
      .dispatchEvent(new Event("error"));

    await expect(pending).rejects.toThrow(/hcaptcha/i);
  });
});
