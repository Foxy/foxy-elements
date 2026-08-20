export const HCAPTCHA_SCRIPT_URL =
  "https://js.hcaptcha.com/1/api.js?render=explicit";

export type HCaptchaApi = {
  render(
    container: HTMLElement,
    options: { sitekey: string; callback(token: string): void },
  ): string;
  reset(widgetId: string): void;
};

let pending: Promise<HCaptchaApi> | null = null;

/** Test seam: drops the memoised promise so each test starts clean. */
export function resetHCaptchaLoaderForTests(): void {
  pending = null;
}

/**
 * Loads hCaptcha once per page and hands back its global.
 *
 * `signUp` cannot be called without a verification token, so this is a hard
 * dependency of the sign-up screen rather than an enhancement. It is isolated
 * here so tests can stub `window.hcaptcha` instead of hitting the network.
 */
export function loadHCaptcha(): Promise<HCaptchaApi> {
  const existing = (window as { hcaptcha?: HCaptchaApi }).hcaptcha;
  if (existing) return Promise.resolve(existing);

  pending ??= new Promise<HCaptchaApi>((resolve, reject) => {
    const script = document.createElement("script");

    script.src = HCAPTCHA_SCRIPT_URL;
    script.async = true;

    script.addEventListener("load", () => {
      const api = (window as { hcaptcha?: HCaptchaApi }).hcaptcha;
      if (api) resolve(api);
      else reject(new Error("hCaptcha loaded without exposing its global."));
    });

    script.addEventListener("error", () =>
      reject(new Error("hCaptcha failed to load.")),
    );

    document.head.append(script);
  });

  return pending;
}
