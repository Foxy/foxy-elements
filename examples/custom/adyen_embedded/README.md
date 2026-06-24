# Adyen Embedded Examples

These pages use the Adyen Advanced Flow. They require a pre-fetched `paymentMethodsResponse` per profile (fetched server-side, stored in `.env.local`, and passed to the selector at page load). The selector shows only the methods returned by Adyen for the given country, amount, currency, and enabled merchant account methods.

Run `npm run localdev:examples`, set the matching env vars in `.env.local`, restart Vite, and open the page at `https://elements.foxy.test` (HTTPS on port 443 when local certs are present, otherwise HTTP on port 80 at `http://elements.foxy.test`). Ports 80 and 443 are privileged on macOS and Linux; use `sudo npm run localdev:examples` if the server fails to bind.

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

When fetching Adyen payment methods for Apple Pay testing, set `ADYEN_RETURN_URL_BASE`:

```sh
ADYEN_RETURN_URL_BASE=https://elements.foxy.test/examples/adyen_embedded \
npm run init:adyen
```

Each page mounts one selector for its payment methods response. If you need multiple live selectors on the same page, create a separate payment methods response for each one.

## Payment Methods Helper

Run `npm run init:adyen` to fetch payment methods for all demo profiles and write the client-safe values into `.env.local`.

Required server-side env vars:

- `ADYEN_API_KEY`
- `ADYEN_MERCHANT_ACCOUNT`
- `ADYEN_CLIENT_KEY`

Optional env vars:

- `ADYEN_ENVIRONMENT`: defaults to `test` and is written as `VITE_ADYEN_ENVIRONMENT`.
- `ADYEN_EXAMPLE_PROFILES`: comma-separated profile list such as `US` or `US,NL`; defaults to `all`.
- `ADYEN_RETURN_URL_BASE`: defaults to `https://elements.foxy.test/examples/adyen_embedded`.
- `ADYEN_CHECKOUT_API_URL`: required when `ADYEN_ENVIRONMENT` is not `test`.
- `ADYEN_SHOPPER_EMAIL`, `ADYEN_SHOPPER_REFERENCE`, `ADYEN_RECURRING_PROCESSING_MODEL`, and `ADYEN_STORE_PAYMENT_METHOD_MODE` for stored-payment-method experiments.

Example:

```sh
ADYEN_API_KEY=... \
ADYEN_MERCHANT_ACCOUNT=... \
ADYEN_CLIENT_KEY=pub.v2.... \
ADYEN_EXAMPLE_PROFILES=US,NL \
npm run init:adyen
```

The script writes `VITE_ADYEN_CLIENT_KEY` once, plus `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_*` for each generated profile. Never store the Adyen API key in a `VITE_*` variable.

## Shared

- `VITE_ADYEN_ENVIRONMENT`: Adyen Web environment. Defaults to `test` when omitted.

## US

- Example page: `us.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_US`
- Buyer profile: United States (`US`), locale `en-US`, currency `USD`

Supported payment methods: Payment Card, ACH Direct Debit, Affirm, Alipay, Alipay+, Apple Pay, Cash App Afterpay, Cash App Pay, Gift Cards, Google Pay, Pay by Bank (US), PaySafeCard, WeChat Pay.

| Method | Adyen type | Notes |
|---|---|---|
| Bank cards | `scheme` | Visa, Mastercard, Amex, etc. |
| AliPay | `alipay` | Redirects to AliPay. Enable in your Adyen merchant account. |
| Cash App Pay | `cashapp` | |
| Google Pay | `googlepay` | |
| Klarna | `klarna` | Pay later. |
| Online Banking | `dragonpay_ebanking` | DragonPay-powered online banking redirect. |
| Paysafecard | `paysafecard` | Redirects to Paysafecard. |
| PayPal | `paypal` | |
| WeChat Pay | `wechatpayQR` / `wechatpayWeb` / `wechatpayMiniProgram` | Three flow variants; all appear if enabled. |

#### Methods intentionally omitted

- **Zip** — Adyen's documentation lists Zip as available in the US, but their demo portal and merchant test environment only show it for Australia. Skipped until confirmed available for US accounts.
- **Venmo** — Venmo is a PayPal funding source, not a standalone Adyen payment method. It is handled through the PayPal Platform integration, not Adyen Embedded.

## Canada (CA)

- Example page: `ca.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_CA`
- Buyer profile: Canada (`CA`), locale `en-CA`, currency `CAD`

Supported payment methods: Payment Card, Affirm, Afterpay, Alipay, Alipay+, Apple Pay, Gift Cards, Google Pay, Interac Online, PAD (Pre-Authorized Debit), PayBright, PaySafeCard, WeChat Pay.

## Germany (DE)

- Example page: `de.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_DE`
- Buyer profile: Germany (`DE`), locale `de-DE`, currency `EUR`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Bank transfer, Billie, Gift Cards, Google Pay, Pay by Bank (Europe), PaySafeCard, Riverty, SEPA Direct Debit, Trustly, WeChat Pay.

## Netherlands (NL)

- Example page: `nl.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_NL`
- Buyer profile: Netherlands (`NL`), locale `nl-NL`, currency `EUR`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Bank transfer, Billie, Gift Cards, Google Pay, iDEAL, PaySafeCard, Riverty, SEPA Direct Debit, WeChat Pay.

## Belgium (BE)

- Example page: `be.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_BE`
- Buyer profile: Belgium (`BE`), locale `nl-BE`, currency `EUR`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Bancontact mobile, Bank transfer, Gift Cards, Google Pay, PaySafeCard, Riverty, SEPA Direct Debit, WeChat Pay.

## Ireland (IE)

- Example page: `ie.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_IE`
- Buyer profile: Ireland (`IE`), locale `en-IE`, currency `EUR`

Supported payment methods: Payment Card, Alipay+, Apple Pay, Bank transfer, Gift Cards, Google Pay, PaySafeCard, SEPA Direct Debit.

## Spain (ES)

- Example page: `es.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_ES`
- Buyer profile: Spain (`ES`), locale `es-ES`, currency `EUR`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Bank transfer, Bizum, Gift Cards, Google Pay, Oney, PaySafeCard, Scalapay, SEPA Direct Debit, WeChat Pay.

## France (FR)

- Example page: `fr.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_FR`
- Buyer profile: France (`FR`), locale `fr-FR`, currency `EUR`

Supported payment methods: Payment Card, ANCV, Alipay, Alipay+, Alma, Apple Pay, Bank transfer, Billie, Gift Cards, Google Pay, Oney, Pay by Bank (Europe), PaySafeCard, Scalapay, SEPA Direct Debit, Titres-Restaurant, WeChat Pay.

## Italy (IT)

- Example page: `it.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_IT`
- Buyer profile: Italy (`IT`), locale `it-IT`, currency `EUR`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Bank transfer, Gift Cards, Google Pay, Oney, PaySafeCard, Scalapay, SEPA Direct Debit, WeChat Pay.

## United Kingdom (GB)

- Example page: `gb.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_GB`
- Buyer profile: United Kingdom (`GB`), locale `en-GB`, currency `GBP`

Supported payment methods: Payment Card, Affirm, Alipay, Alipay+, Apple Pay, BACS Direct Debit, Billie, Clearpay, Gift Cards, Google Pay, Pay by Bank (Europe), PaySafeCard, WeChat Pay.

## Switzerland (CH)

- Example page: `ch.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_CH`
- Buyer profile: Switzerland (`CH`), locale `de-CH`, currency `CHF`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Gift Cards, Google Pay, PaySafeCard, Riverty, TWINT.

## Australia (AU)

- Example page: `au.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_AU`
- Buyer profile: Australia (`AU`), locale `en-AU`, currency `AUD`

Supported payment methods: Payment Card, Afterpay, Alipay, Alipay+, Apple Pay, Gift Cards, Google Pay, PaySafeCard, PayTo, WeChat Pay, Zip.

## New Zealand (NZ)

- Example page: `nz.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_NZ`
- Buyer profile: New Zealand (`NZ`), locale `en-NZ`, currency `NZD`

Supported payment methods: Payment Card, Afterpay, Alipay, Alipay+, Apple Pay, Gift Cards, Google Pay, PaySafeCard, WeChat Pay, Zip.

## Sweden (SE)

- Example page: `se.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_SE`
- Buyer profile: Sweden (`SE`), locale `sv-SE`, currency `SEK`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Billie, Gift Cards, Google Pay, PaySafeCard, Swish, Trustly, Walley.

## Poland (PL)

- Example page: `pl.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_PL`
- Buyer profile: Poland (`PL`), locale `pl-PL`, currency `PLN`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, BLIK, Gift Cards, Google Pay, Online banking Poland, PayPo, PaySafeCard.

## Czech Republic (CZ)

- Example page: `cz.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_CZ`
- Buyer profile: Czech Republic (`CZ`), locale `cs-CZ`, currency `CZK`

Supported payment methods: Payment Card, Alipay, Alipay+, Apple Pay, Gift Cards, Google Pay, Online banking Czech Republic, PaySafeCard.

## Serbia (RS)

- Example page: `rs.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_RS`
- Buyer profile: Serbia (`RS`), locale `sr-RS`, currency `RSD`

Supported payment methods: Payment Card, Gift Cards.

## Norway (NO)

- Example page: `no.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY`, `VITE_ADYEN_PAYMENT_METHODS_RESPONSE_NO`
- Buyer profile: Norway (`NO`), locale `nb-NO`, currency `NOK`

Supported payment methods: Payment Card, Billie, Gift Cards, PaySafeCard, Trustly, Vipps.

> Payment method availability depends on your Adyen merchant account configuration, acquiring region, and contract. See [docs.adyen.com](https://docs.adyen.com/payment-methods) for the latest list.

## Creating Payment Methods Responses Manually

You can also fetch each payment methods response server-side with your Adyen API key and merchant account, then copy the response JSON into `.env.local`. The browser examples consume `payment_methods_response`, `client_key`, and `environment` from the gateway config; never expose your Adyen API key in `VITE_*` variables.

```js
// In the gateway config of each example page:
payment_methods_response: JSON.parse(import.meta.env.VITE_ADYEN_PAYMENT_METHODS_RESPONSE_XX ?? "{}")
```
