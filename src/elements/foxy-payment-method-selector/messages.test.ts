import { describe, expect, it } from "vitest";
import catalog from "@/locales/en-US.json";
import { messages } from "./messages";

const MESSAGES_MODULE = "/messages.ts";
const TEST_MODULE = "/messages.test.ts";

// `npm run extract` regenerates the catalog but never fails, so drift between
// the descriptors and the committed JSON is silent, and a descriptor nothing
// reads stays in the catalog indefinitely. These check both.
const descriptors = Object.entries(messages).map(([name, descriptor]) => ({
  name,
  id: descriptor.id as string,
  defaultMessage: descriptor.defaultMessage as string,
}));

// Raw sources, so a descriptor's users are found without importing the modules
// that read them.
const sources = import.meta.glob("@/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

// `messages.x` references count from the descriptor module too -- the option
// maps below `defineMessages` are a legitimate user. Only this test is excluded.
const references = Object.entries(sources)
  .filter(([path]) => !path.endsWith(TEST_MODULE))
  .map(([, source]) => source);

// Bare id literals must NOT count from the descriptor module: every id appears
// there by definition, which would make the unused-key check below pass for
// anything. Consumers that look a key up by string are the point of this one.
const idReferences = Object.entries(sources)
  .filter(([path]) => {
    return !path.endsWith(TEST_MODULE) && !path.endsWith(MESSAGES_MODULE);
  })
  .map(([, source]) => source);

describe("messages", () => {
  it("scanned the source tree", () => {
    // Everything below reads as passing if the glob resolves to nothing, so
    // fail loudly instead of silently checking an empty corpus.
    expect(references.length).toBeGreaterThan(50);
    expect(idReferences.length).toBe(references.length - 1);
    expect(descriptors.length).toBeGreaterThan(0);
  });

  it("has no descriptor the catalog is missing", () => {
    const missing = descriptors
      .filter(({ id }) => !(id in catalog))
      .map(({ name, id }) => `${name} (${id})`);

    // Fails when a string was added without re-running `npm run extract`.
    expect(missing).toEqual([]);
  });

  it("has no catalog key without a descriptor", () => {
    const ids = new Set(descriptors.map(({ id }) => id));
    const orphans = Object.keys(catalog).filter((key) => !ids.has(key));

    // Fails when a descriptor was removed without re-running `npm run extract`.
    expect(orphans).toEqual([]);
  });

  it("matches the catalog text for every descriptor", () => {
    const drifted = descriptors
      .filter(({ id, defaultMessage }) => {
        return (catalog as Record<string, string>)[id] !== defaultMessage;
      })
      .map(({ name }) => name);

    expect(drifted).toEqual([]);
  });

  it("has a user for every descriptor", () => {
    const unused = descriptors
      .filter(({ name, id }) => {
        const reference = new RegExp(`messages\\.${name}\\b`);
        const referenced = references.some((source) => reference.test(source));
        const lookedUpById = idReferences.some((source) => {
          return source.includes(`"${id}"`);
        });

        return !referenced && !lookedUpById;
      })
      .map(({ name, id }) => `${name} (${id})`);

    // A key nothing reads is dead weight in every translation that follows it.
    expect(unused).toEqual([]);
  });
});

describe("catalog", () => {
  it("keeps every key under the payment_ namespace", () => {
    // Per-component namespacing: duplicated text across options is deliberate,
    // because it is what lets a consumer override one option's copy without
    // touching the rest. Do not collapse identical strings onto one key.
    const foreign = Object.keys(catalog).filter((key) => {
      return !key.startsWith("payment_");
    });

    expect(foreign).toEqual([]);
  });
});
