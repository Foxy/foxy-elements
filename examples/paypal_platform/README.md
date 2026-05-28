# PayPal Platform Examples

These notes accompany the country-specific examples under `examples/foxy-payment-method-selector/paypal_platform/`.

## US

- Example page: `us.html`
- Env var: `VITE_PAYPAL_SANDBOX_CLIENT_ID_US`
- Buyer profile: United States (`US`), locale `en-US`, currency `USD`
- Setup: Set `VITE_PAYPAL_SANDBOX_CLIENT_ID_US` in `.env.local` and restart `npm run localdev:examples` after changes.
- PayPal account requirements: Use a sandbox app backed by a sandbox business account with standard PayPal Checkout enabled. Venmo, Pay Later, and PayPal Credit remain merchant- and buyer-eligibility dependent.
- Expected methods: PayPal, New Card, Apple Pay, Google Pay, PayPal Pay Later, Venmo
- May also appear: PayPal Credit

## BE

- Example page: `be.html`
- Env var: `VITE_PAYPAL_SANDBOX_CLIENT_ID_BE`
- Buyer profile: Belgium (`BE`), locale `nl-BE`, currency `EUR`
- Setup: Set `VITE_PAYPAL_SANDBOX_CLIENT_ID_BE` in `.env.local` and restart `npm run localdev:examples` after changes.
- PayPal account requirements: Use a sandbox app backed by a sandbox business account with Bancontact enabled.
- Expected methods: PayPal, New Card, Apple Pay, Google Pay, Bancontact

## NL

- Example page: `nl.html`
- Env var: `VITE_PAYPAL_SANDBOX_CLIENT_ID_NL`
- Buyer profile: Netherlands (`NL`), locale `nl-NL`, currency `EUR`
- Setup: Set `VITE_PAYPAL_SANDBOX_CLIENT_ID_NL` in `.env.local` and restart `npm run localdev:examples` after changes.
- PayPal account requirements: Use a sandbox app backed by a sandbox business account with iDEAL enabled. PayPal can take a few minutes to propagate new iDEAL signups.
- Expected methods: PayPal, New Card, Apple Pay, Google Pay, iDEAL

## AT

- Example page: `at.html`
- Env var: `VITE_PAYPAL_SANDBOX_CLIENT_ID_AT`
- Buyer profile: Austria (`AT`), locale `de-AT`, currency `EUR`
- Setup: Set `VITE_PAYPAL_SANDBOX_CLIENT_ID_AT` in `.env.local` and restart `npm run localdev:examples` after changes.
- PayPal account requirements: Use a sandbox app backed by a sandbox business account with EPS enabled.
- Expected methods: PayPal, New Card, Apple Pay, Google Pay, EPS

## PL

- Example page: `pl.html`
- Env var: `VITE_PAYPAL_SANDBOX_CLIENT_ID_PL`
- Buyer profile: Poland (`PL`), locale `pl-PL`, currency `PLN`
- Setup: Set `VITE_PAYPAL_SANDBOX_CLIENT_ID_PL` in `.env.local` and restart `npm run localdev:examples` after changes.
- PayPal account requirements: Use a sandbox app backed by a sandbox business account with BLIK and Przelewy24 enabled.
- Expected methods: PayPal, New Card, Apple Pay, Google Pay, BLIK, Przelewy24
