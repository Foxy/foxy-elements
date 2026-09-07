import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveLanguageStrings } from "./language-strings";

const BASE = new URL("https://demo.foxycart.com/s/customer/");

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function respondWith(body: unknown, ok = true) {
  fetchMock.mockResolvedValue({ ok, status: ok ? 200 : 500, json: async () => body });
}

describe("resolveLanguageStrings", () => {
  it("returns the locale and values from the response", async () => {
    respondWith({ locale_code: "fr-FR", values: { portal_back: "Retour" } });

    const result = await resolveLanguageStrings({ base: BASE });

    expect(result).toEqual({
      locale: "fr-FR",
      messages: { portal_back: "Retour" },
    });
  });

  // Empty messages is not a broken state: `defineMessages` compiles a
  // `defaultMessage` into the bundle for every key, so react-intl renders
  // correct English from it. A failed request costs a language, not the
  // portal.
  it("falls back to English when the request rejects", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));

    const result = await resolveLanguageStrings({ base: BASE });

    expect(result).toEqual({ locale: "en-US", messages: {} });
  });

  // A 500 usually still carries a JSON body. Without a status check that body
  // parses cleanly and `locale_code` lands on `IntlProvider` as undefined.
  it("falls back to English on a non-OK status", async () => {
    respondWith({ message: "server error" }, false);

    const result = await resolveLanguageStrings({ base: BASE });

    expect(result).toEqual({ locale: "en-US", messages: {} });
  });

  // The portal blocks first paint on this request, so without a ceiling a
  // hung endpoint is a skeleton that never resolves.
  it(
    "falls back to English when the request outlives the ceiling",
    async () => {
      fetchMock.mockImplementation(() => new Promise(() => {}));

      const result = await resolveLanguageStrings({ base: BASE, timeoutMs: 10 });

      expect(result).toEqual({ locale: "en-US", messages: {} });
    },
    2000,
  );

  it("asks for the given template set", async () => {
    respondWith({ locale_code: "en-US", values: {} });

    await resolveLanguageStrings({ base: BASE, templateSetId: "123" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://demo.foxycart.com/s/customer/language_strings?template_set_id=123",
    );
  });

  // Absent means the store's default template set, resolved server-side. An
  // empty `template_set_id=` would ask for a set with no id instead.
  it("omits the parameter when no template set is given", async () => {
    respondWith({ locale_code: "en-US", values: {} });

    await resolveLanguageStrings({ base: BASE });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://demo.foxycart.com/s/customer/language_strings",
    );
  });

  // A 200 carrying the wrong shape is what a half-built endpoint returns.
  // Without this the element hands `IntlProvider` an undefined locale and an
  // undefined catalogue, which is worse than plain English.
  it("falls back to English when the body is missing its fields", async () => {
    respondWith({});

    const result = await resolveLanguageStrings({ base: BASE });

    expect(result).toEqual({ locale: "en-US", messages: {} });
  });
});
