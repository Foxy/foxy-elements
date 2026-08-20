export const HCAPTCHA_SCRIPT_URL =
  "https://js.hcaptcha.com/1/api.js?render=explicit";

export type HCaptchaApi = {
  render(
    container: HTMLElement,
    options: { sitekey: string; callback(token: string): void },
  ): string;
  reset(widgetId: string): void;
};

/** Injects `src` as a `<script>` and resolves once it has loaded. */
type ScriptLoader = (src: string) => Promise<void>;

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = src;
    script.async = true;

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error("hCaptcha failed to load.")),
    );

    document.head.append(script);
  });
}

let loadScript: ScriptLoader = injectScript;
let pending: Promise<HCaptchaApi> | null = null;

/** Test seam: drops the memoised promise and restores the real script
 * loader, so each test starts clean. */
export function resetHCaptchaLoaderForTests(): void {
  pending = null;
  loadScript = injectScript;
}

/**
 * Test seam: replaces the script-injection step with a fake, so tests can
 * resolve or reject on demand without creating a DOM node that points at a
 * real external URL. Production always uses the real `injectScript`.
 */
export function setHCaptchaScriptLoaderForTests(loader: ScriptLoader): void {
  loadScript = loader;
}

/**
 * Loads hCaptcha once per page and hands back its global.
 *
 * `signUp` cannot be called without a verification token, so this is a hard
 * dependency of the sign-up screen rather than an enhancement. The actual
 * script injection is isolated behind `loadScript` so tests can stub it
 * instead of hitting the network.
 */
export function loadHCaptcha(): Promise<HCaptchaApi> {
  const existing = (window as { hcaptcha?: HCaptchaApi }).hcaptcha;
  if (existing) return Promise.resolve(existing);

  pending ??= loadScript(HCAPTCHA_SCRIPT_URL).then(() => {
    const api = (window as { hcaptcha?: HCaptchaApi }).hcaptcha;
    if (!api) throw new Error("hCaptcha loaded without exposing its global.");
    return api;
  });

  return pending;
}
