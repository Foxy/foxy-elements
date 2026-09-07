import { describe, expect, it } from "vitest";
import catalog from "@/locales/en-US.json";

/**
 * The portal's keys have to exist twice: here, and in Foxy's default language
 * strings (`v/3.0.0/lang/english.inc.php`, FX-371). Nothing publishes one to
 * the other, so a key added here is a key the endpoint will not serve until
 * someone seeds it, and the portal renders that string's compiled
 * `defaultMessage` English in the meantime.
 *
 * That degradation is by design, which is exactly why it needs a tripwire:
 * silent English is easy to miss in review. This snapshot turns adding or
 * renaming a portal key into a deliberate diff that names the key, so the
 * seeding step is remembered rather than discovered by a French customer.
 *
 * Updating it is correct and expected -- run with `-u`, and make sure the
 * change reaches FX-371.
 */
describe("portal catalog", () => {
  it("matches the committed key list", async () => {
    const keys = Object.keys(catalog)
      .filter((key) => key.startsWith("portal_"))
      .sort();

    await expect(`${keys.length} keys\n\n${keys.join("\n")}\n`).toMatchFileSnapshot(
      "./__snapshots__/portal-keys.txt",
    );
  });
});
