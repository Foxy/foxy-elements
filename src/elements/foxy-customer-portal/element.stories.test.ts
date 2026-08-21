import { afterEach, describe, expect, it, vi } from "vitest";
import { stubStore } from "./element.stories";
import { loadHCaptcha, resetHCaptchaLoaderForTests } from "./hcaptcha";

afterEach(() => {
  resetHCaptchaLoaderForTests();
});

describe("stubStore", () => {
  it("blocks hCaptcha script injection instead of letting a story reach the network", async () => {
    // Canary, not the assertion: if `stubStore`'s hCaptcha guard is ever
    // missing, `loadHCaptcha()` falls through to the real script loader,
    // which appends a `<script src="https://js.hcaptcha.com/...">` to
    // `document.head` -- and the browser starts that request the instant the
    // node is inserted, before any `load`/`error` event fires. Spying on
    // `append` catches the attempt synchronously, before insertion, so
    // proving this test goes red (see the report) never actually dispatches
    // the request. Its error is deliberately a different message from the
    // guard's own, so a passing assertion below can only mean the guard
    // itself fired -- not that the canary quietly did its job instead.
    const realAppend = document.head.append.bind(document.head);
    const appendSpy = vi
      .spyOn(document.head, "append")
      .mockImplementation((...nodes: (Node | string)[]) => {
        for (const node of nodes) {
          if (
            node instanceof HTMLScriptElement &&
            node.src.startsWith("https://js.hcaptcha.com")
          ) {
            throw new Error("canary: a real hCaptcha script was appended");
          }
        }
        return realAppend(...nodes);
      });

    const restore = stubStore();

    try {
      await expect(loadHCaptcha()).rejects.toThrow(
        "A story tried to load hCaptcha.",
      );
    } finally {
      restore();
      appendSpy.mockRestore();
    }
  });
});
