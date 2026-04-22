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

Load one or more elements directly from a CDN build and then use them in markup:

```html
<script
  type="module"
  src="https://cdn-js.foxy.io/elements@2/foxy-ach-field.js"
></script>
<foxy-ach-field field="routing_number"></foxy-ach-field>
```

## npm Usage

Install:

```bash
npm install @foxy.io/elements
```

Import the elements you need:

```ts
import "@foxy.io/elements/foxy-ach-field";
```

Use in your app (HTML or JSX):

```html
<foxy-payment-method-selector></foxy-payment-method-selector>
```

## SDK and Duplicate Modules

Some elements in this repo may use our SDK to interact with our API. If you also need to use our SDK in your code, please make sure you're not loading or bundling it twice to avoid errors:

- When working with the CDN build of Elements, always load the SDK from `https://cdn-js.foxy.io/sdk@2/[module-name].js`. Do not use 3rd-party CDNs and do not use fixed versions.
- When working with the npm build of Elements, verify that the SDK version range in your `package.json` is compatible with the one used in the Elements package. You can use `npm find-dupes` to check if the SDK is included more than once.
- Never mix CDN and npm builds. We recommend CDN builds for lightweight integrations or low-code website builders and npm builds for everything else.

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set required environment variables in `.env`:

   ```bash
   VITE_STRIPE_DEMO_PUBLISHABLE_KEY=pk_test_123...
   VITE_EMBED_ORIGIN=https://embed.foxy.io
   ```

3. Start local Storybook development:

   ```bash
   npm run localdev
   ```

4. Build outputs:

   ```bash
   npm run build:npm   # npm package build
   npm run build:cdn   # CDN-optimized build
   npm run build:storybook
   ```

5. (Optional) Extract i18n messages:

   ```bash
   npm run extract
   ```
