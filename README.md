# Foxy Elements

Embeddable Foxy checkout web components for collecting ACH and card payment details, plus a payment method selector UI.

## What's Exported

Package exports:

- `@foxy.io/elements/foxy-ach-field`
- `@foxy.io/elements/foxy-payment-card-field`
- `@foxy.io/elements/foxy-payment-method-selector`

Custom elements registered by these modules:

- `foxy-ach-field`
- `foxy-payment-card-field`
- `foxy-payment-method-selector`

The package also exports related TypeScript types and event constants from each entrypoint.

## CDN Usage

First, load the SDK initializer script from our CDN. Replace `your-store-domain` in the `src` with your store's domain at Foxy:

```html
<script
  type="module"
  src="https://cdn-js.foxy.io/sdk@2/checkout/loader.js?store=your-store-domain"
></script>
```

Then load one or more elements directly from a CDN build and then use them in markup. Our elements will automatically pick up the relevant SDK configuration from the loader script above:

```html
<script
  type="module"
  src="https://cdn-js.foxy.io/elements@2/foxy-ach-field.js"
></script>
<foxy-ach-field type="routing-number"></foxy-ach-field>
```

## npm Usage

Install Elements and SDK:

```bash
npm install @foxy.io/sdk@2 @foxy.io/elements@2
```

Initialize the API client from our SDK like so:

```js
import { client } from "@foxy.io/sdk/checkout/client";
client.setStoreDomain("your-store-domain");
```

Then import the elements you need:

```ts
import "@foxy.io/elements/foxy-ach-field";
```

And use them your app:

```html
<foxy-payment-method-selector></foxy-payment-method-selector>
```

## Attributes and Properties

All custom element configuration in this package is available through HTML
attributes and through corresponding JavaScript properties.

- Dashed HTML attributes map to camelCase properties.
- Native HTMLElement properties such as `lang` keep their native names.
- Boolean flags such as `disabled` use boolean properties and reflected
  attributes.

Example:

```ts
const cardField = document.querySelector("foxy-payment-card-field");
cardField.translationCardNumberLabel = "Card number";
cardField.themeInputHeight = "56px";

const selector = document.querySelector("foxy-payment-method-selector");
selector.optionIndex = 1;
selector.themePrimary = "#111827";
```

The themed elements in this package share one canonical theme API. The current
shared theme properties and matching dashed attributes are:

- `themeBackground` / `theme-background`
- `themeForeground` / `theme-foreground`
- `themeCard` / `theme-card`
- `themeCardForeground` / `theme-card-foreground`
- `themePrimary` / `theme-primary`
- `themePrimaryForeground` / `theme-primary-foreground`
- `themeMuted` / `theme-muted`
- `themeMutedForeground` / `theme-muted-foreground`
- `themeDestructive` / `theme-destructive`
- `themeBorder` / `theme-border`
- `themeInput` / `theme-input`
- `themeRing` / `theme-ring`
- `themeFontSans` / `theme-font-sans`
- `themeRadius` / `theme-radius`
- `themeSpacing` / `theme-spacing`
- `themeInputPlaceholderColor` / `theme-input-placeholder-color`
- `themeInputHeight` / `theme-input-height`
- `themeInputPadding` / `theme-input-padding`
- `themeInputPaddingX` / `theme-input-padding-x`
- `themeInputPaddingY` / `theme-input-padding-y`
- `themeInputTextColor` / `theme-input-text-color`
- `themeInputErrorTextColor` / `theme-input-error-text-color`
- `themeInputFontSize` / `theme-input-font-size`

Elements accept the full shared theme surface even when a particular token does
not currently affect that element's rendering. Existing element-specific theme
behavior is unchanged.

See the Storybook docs for each element for the full attribute/property API
surface.

## SDK and Duplicate Modules

Some elements in this repo may use our SDK to interact with our API. If you also need to use our SDK in your code, please make sure you're not loading or bundling it twice to avoid errors:

- When working with the CDN build of Elements, always load the SDK from `https://cdn-js.foxy.io/sdk@2/**`. Do not use 3rd-party CDNs and do not use fixed versions.
- When working with the npm build of Elements, verify that the SDK version range in your `package.json` is compatible with the one used in the Elements package. You can use `npm find-dupes` to check if the SDK is included more than once.
- Avoid mixing CDN and npm builds. We recommend CDN builds for lightweight integrations or low-code website builders and npm builds for everything else.
- If you absolutely need to mix CDN and npm builds (for example, to use a custom React app on our hosted pages), externalize SDK and Elements on build and replace them with CDN module imports.

## Development

Use Node 22 for local development.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set required environment variables in `.env`:

   ```bash
   VITE_STRIPE_DEMO_PUBLISHABLE_KEY=pk_test_123...
   VITE_FOXYCART_DOMAIN=foxycart.com
   VITE_EMBED_ORIGIN=https://embed.foxy.io
   ```

   Optional Klarna Storybook setup:

   ```bash
   KLARNA_USERNAME=your-klarna-username
   KLARNA_PASSWORD=your-klarna-password
   KLARNA_API_URL=https://api.playground.klarna.com
   KLARNA_MERCHANT_URL_AUTHORIZATION=https://example.com/checkout/klarna/authorization
   ```

   If Klarna returns `HTTP 403 INVALID_OPERATION` during session creation, the most common cause is an endpoint or region mismatch for the MID. Start with `https://api.playground.klarna.com` unless Klarna gave you a different regional playground host for that account.

   Run `npm run init:klarna` to open a sandbox Klarna session and write a Vite-safe encoded copy of the session response to `.env.local` as `VITE_KLARNA_INIT_RESPONSE`.

   Optional Square Web Payments examples setup:

   ```bash
   VITE_SQUARE_APP_ID=sandbox-sq0idb-...
   VITE_SQUARE_LOCATION_ID=...
   VITE_SQUARE_ENVIRONMENT=sandbox
   ```

   These are client-safe credentials — Square embeds them in the page. Find them in the [Square Developer Dashboard](https://developer.squareup.com/apps) under **Credentials** (app ID) and **Locations** (location ID). Use `sandbox` for the environment unless you have a production Square account. See `examples/square_up/README.md` for the full per-country method availability table. Storybook and Vitest can read that generated value, and the Klarna stories will prefer it over the built-in fixture when present. Restart Storybook after refreshing the session because Vite reads env files at startup.

3. Start local Storybook development:

   ```bash
   npm run localdev:storybook
   ```

4. Start local examples (requires Caddy to be installed):

  ```bash
  npm run localdev:examples
  ```

  Add `elements.foxy.test` to your hosts file and open `https://elements.foxy.test/examples/[path/to/example]`.

5. Build outputs:

   ```bash
   npm run build:npm   # npm package build
   npm run build:cdn   # CDN-optimized build
   npm run build:storybook
   ```

6. (Optional) Extract i18n messages:

   ```bash
   npm run extract
   ```

## Testing

Two vitest projects are configured in `vitest.config.ts`, and both run in real Chromium via Playwright:

```bash
npx vitest run --project=unit        # src/**/*.test.ts
npx vitest run --project=storybook   # every story, headless
```

Omit `--project` to run both. If Playwright reports a missing browser, install it with `npx playwright install chromium`.

The environment variables from step 2 above are a precondition for the suites, not just for the dev server. `foxy-payment-card-field` reads `VITE_EMBED_ORIGIN` at module scope, so without it the module throws `VITE_EMBED_ORIGIN is required.` as soon as vitest imports it, and both projects fail before running a single test. A red suite on a fresh checkout usually means the env file, not the branch.

Gateway credentials are **not** required. Stories and unit tests supply their own checkout state rather than opening real sessions, so both projects pass with no sandbox credentials configured. `npm run init:klarna` and friends matter only when you are checking that a gateway renders correctly in Storybook or in the standalone examples.

If a run fails with `[vitest] Vite unexpectedly reloaded a test` followed by `Failed to fetch dynamically imported module`, the dependency cache predates a file you just added: Vite re-optimizes mid-run and reloads the browser. Re-running passes, which makes it look like a flaky suite. To stop it recurring, add whatever the run lists under `dependencies optimized: …` to `optimizeDeps.include` in `vitest.config.ts`.
