import { describe, expect, it } from "vitest";
import { resolveBaseUrl } from "./store-domain";

describe("resolveBaseUrl", () => {
  it("appends .foxycart.com to a bare label", () => {
    expect(resolveBaseUrl("demo").toString()).toBe(
      "https://demo.foxycart.com/s/customer/",
    );
  });

  it("uses a dotted value verbatim", () => {
    expect(resolveBaseUrl("demo.foxycart.com").toString()).toBe(
      "https://demo.foxycart.com/s/customer/",
    );
  });

  it("supports custom domains", () => {
    expect(resolveBaseUrl("shop.example.com").toString()).toBe(
      "https://shop.example.com/s/customer/",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(resolveBaseUrl("  demo  ").toString()).toBe(
      "https://demo.foxycart.com/s/customer/",
    );
  });

  it("returns a URL, not a string", () => {
    expect(resolveBaseUrl("demo")).toBeInstanceOf(URL);
  });

  it("throws on an empty domain", () => {
    expect(() => resolveBaseUrl("   ")).toThrow(TypeError);
  });
});
