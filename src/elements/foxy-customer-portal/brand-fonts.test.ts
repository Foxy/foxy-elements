import { describe, expect, it } from "vitest";
import { ensureBrandFonts } from "./brand-fonts";

describe("ensureBrandFonts", () => {
  it("adds the brand font stylesheet to the head once", () => {
    const doc = document.implementation.createHTMLDocument("t");
    ensureBrandFonts(doc);
    ensureBrandFonts(doc);
    const links = doc.head.querySelectorAll('link[rel="stylesheet"]');
    expect(links).toHaveLength(1);
    expect((links[0] as HTMLLinkElement).href).toContain("Albert+Sans");
  });
});
