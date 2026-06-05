# Square Web Payments Examples

These pages demonstrate the `foxy-payment-method-selector` with a `square_up` payment gateway. Unlike Adyen, Square's SDK does not return a payment methods list from the server. Instead, the selector derives the available methods from the checkout locale (`format.locale_code`) using a static map built from Square's [payment card support by country](https://developer.squareup.com/docs/payment-card-support-by-country) documentation.

Run `npm run localdev:examples`, set the required env vars in `.env.local`, restart Vite, and open the page at `https://elements.foxy.test` (HTTPS on port 443 when local certs are present, otherwise HTTP on port 80 at `http://elements.foxy.test`). Ports 80 and 443 are privileged on macOS and Linux; use `sudo npm run localdev:examples` if the server fails to bind.

The dev server requires a local TLS certificate (for Apple Pay, which validates the page origin). Run once to generate it:

```sh
mkcert -cert-file .certs/elements.foxy.test.pem \
       -key-file  .certs/elements.foxy.test-key.pem \
       elements.foxy.test
```

And add the host to `/etc/hosts` if not already present:

```sh
sudo sh -c 'echo "127.0.0.1 elements.foxy.test" >> /etc/hosts'
```

## Env vars

Add to `.env.local`:

```sh
VITE_SQUARE_APP_ID=sandbox-sq0idb-...
VITE_SQUARE_LOCATION_ID=...
VITE_SQUARE_ENVIRONMENT=sandbox
```

- `VITE_SQUARE_APP_ID`: Your Square application ID. For sandbox, this starts with `sandbox-sq0idb-`. Find it in the [Square Developer Dashboard](https://developer.squareup.com/apps) under your app's **Credentials** tab.
- `VITE_SQUARE_LOCATION_ID`: The Square location ID for the merchant account. Find it under **Locations** in the Developer Dashboard.
- `VITE_SQUARE_ENVIRONMENT`: `sandbox` (default) or `production`. The sandbox and production SDKs are loaded from different CDN URLs; using a production app ID against the sandbox environment (or vice versa) will fail.

Never put `VITE_SQUARE_APP_ID` or `VITE_SQUARE_LOCATION_ID` in server-only files — they are intentionally client-safe values that Square embeds in the page.

## Method availability by country

The selector generates one payment option entry per supported method. The table below reflects the static map at `SQUARE_UP_METHODS_BY_COUNTRY` in `element.tsx`:

| Method | US | CA | AU | GB | FR | IE | ES |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Card (`new-card`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ACH (`ach`) | ✅ | | | | | | |
| Apple Pay (`apple-pay`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Google Pay (`google-pay`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cash App Pay (`cash-app`) | ✅ | | | | | | |
| Afterpay/Clearpay (`afterpay`) | ✅ | ✅ | ✅ | ✅ | | | |

Card and ACH options render an inline form via the Square Web Payments SDK. Apple Pay, Google Pay, Cash App Pay, and Afterpay are "button-only" — the selector shows a redirect hint and the integrator is responsible for rendering the actual payment button (e.g. using `checkoutClient.square` directly).

If the checkout locale is missing or unrecognised, the selector falls back to Card only.

## United States (US)

- Example page: `us.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: United States (`US`), locale `en-US`, currency `USD`

Supported methods: Card, ACH, Apple Pay, Google Pay, Cash App Pay, Afterpay.

| Method | foxy type | Notes |
|---|---|---|
| Credit / debit card | `new-card` | Visa, Mastercard, Amex, Discover, JCB, UnionPay. Inline iframe form. |
| ACH bank transfer | `ach` | US only. Customer enters routing and account numbers directly. |
| Apple Pay | `apple-pay` | Button rendered by integrator. Requires HTTPS and a valid domain association. |
| Google Pay | `google-pay` | Button rendered by integrator. |
| Cash App Pay | `cash-app` | Button rendered by integrator. US only. |
| Afterpay | `afterpay` | Button rendered by integrator. |

## Canada (CA)

- Example page: `ca.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: Canada (`CA`), locale `en-CA`, currency `CAD`

Supported methods: Card, Apple Pay, Google Pay, Afterpay.

## Australia (AU)

- Example page: `au.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: Australia (`AU`), locale `en-AU`, currency `AUD`

Supported methods: Card, Apple Pay, Google Pay, Afterpay.

## United Kingdom (GB)

- Example page: `gb.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: United Kingdom (`GB`), locale `en-GB`, currency `GBP`

Supported methods: Card, Apple Pay, Google Pay, Afterpay.

## France (FR)

- Example page: `fr.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: France (`FR`), locale `fr-FR`, currency `EUR`

Supported methods: Card, Apple Pay, Google Pay.

## Ireland (IE)

- Example page: `ie.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: Ireland (`IE`), locale `en-IE`, currency `EUR`

Supported methods: Card, Apple Pay, Google Pay.

## Spain (ES)

- Example page: `es.html`
- Env vars: `VITE_SQUARE_APP_ID`, `VITE_SQUARE_LOCATION_ID`, `VITE_SQUARE_ENVIRONMENT`
- Buyer profile: Spain (`ES`), locale `es-ES`, currency `EUR`

Supported methods: Card, Apple Pay, Google Pay.

> Payment method availability is determined at build time from Square's published documentation and the checkout locale. See [developer.squareup.com/docs/payment-card-support-by-country](https://developer.squareup.com/docs/payment-card-support-by-country) for the authoritative list. If Square adds a new method or country, update `SQUARE_UP_METHODS_BY_COUNTRY` in `element.tsx` and add the corresponding example page.
