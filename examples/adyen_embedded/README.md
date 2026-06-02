# Adyen Embedded Examples

These pages require real Adyen Sessions data. They do not mock `paymentMethodsResponse`, so the selector only shows methods returned by Adyen for the session, country, amount, currency, and enabled merchant account methods.

Run `npm run localdev:examples`, set the matching env vars in `.env.local`, restart Vite, and open the page at `https://elements.foxy.test:6007`.

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

When creating Adyen sessions for Apple Pay testing, set `ADYEN_RETURN_URL_BASE`:

```sh
ADYEN_RETURN_URL_BASE=https://elements.foxy.test/examples/adyen_embedded \
npm run init:adyen
```

Each page mounts one selector for its Adyen Session. If you need multiple live selectors on the same page, create a separate Session for each one; Adyen Web Components can behave unpredictably when the same Session is mounted more than once.

## Session Helper

Run `npm run init:adyen` to create Sessions for all demo profiles and write the client-safe values into `.env.local`.

Required server-side env vars:

- `ADYEN_API_KEY`
- `ADYEN_MERCHANT_ACCOUNT`
- `ADYEN_CLIENT_KEY` or a profile-specific key such as `ADYEN_CLIENT_KEY_US`

Optional env vars:

- `ADYEN_ENVIRONMENT`: defaults to `test` and is written as `VITE_ADYEN_ENVIRONMENT`.
- `ADYEN_EXAMPLE_PROFILES`: comma-separated profile list such as `US` or `US,NL`; defaults to `all`.
- `ADYEN_RETURN_URL_BASE`: defaults to `http://localhost:6007/examples/adyen_embedded`.
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

The script writes `VITE_ADYEN_CLIENT_KEY_*`, `VITE_ADYEN_SESSION_ID_*`, and `VITE_ADYEN_SESSION_DATA_*` for each generated profile. Never store the Adyen API key in a `VITE_*` variable.

## Shared

- `VITE_ADYEN_ENVIRONMENT`: Adyen Web environment. Defaults to `test` when omitted.

## US

- Example page: `us.html`
- Env vars: `VITE_ADYEN_CLIENT_KEY_US`, `VITE_ADYEN_SESSION_ID_US`, `VITE_ADYEN_SESSION_DATA_US`
- Buyer profile: United States (`US`), locale `en-US`, currency `USD`

### Supported US payment methods

The following methods are returned by the Adyen test session and supported by the selector when enabled on your merchant account:

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

## Creating Sessions Manually

You can also create each session server-side with your Adyen API key and merchant account, then copy the client-safe response values into `.env.local`. The browser examples only consume `id`, `sessionData`, `clientKey`, and `environment`; never expose your Adyen API key in `VITE_*` variables.
