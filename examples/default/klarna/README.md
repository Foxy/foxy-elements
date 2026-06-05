# Klarna Playgrounds

Per-country playground pages for the Klarna integration in `foxy-payment-method-selector`.

## Available pages

| File | Country | Locale | Currency |
|------|---------|--------|----------|
| `us.html` | United States | en-US | USD |
| `ca.html` | Canada | en-CA | CAD |
| `gb.html` | United Kingdom | en-GB | GBP |
| `de.html` | Germany | de-DE | EUR |
| `fr.html` | France | fr-FR | EUR |
| `nl.html` | Netherlands | nl-NL | EUR |
| `be.html` | Belgium | nl-BE | EUR |
| `ie.html` | Ireland | en-IE | EUR |
| `es.html` | Spain | es-ES | EUR |
| `it.html` | Italy | it-IT | EUR |
| `ch.html` | Switzerland | de-CH | CHF |
| `at.html` | Austria | de-AT | EUR |
| `se.html` | Sweden | sv-SE | SEK |
| `no.html` | Norway | nb-NO | NOK |
| `pl.html` | Poland | pl-PL | PLN |
| `cz.html` | Czech Republic | cs-CZ | CZK |
| `rs.html` | Serbia | sr-RS | RSD |
| `au.html` | Australia | en-AU | AUD |
| `nz.html` | New Zealand | en-NZ | NZD |

## Setup

Run the init script to create Klarna sessions and populate `.env.local`:

```bash
KLARNA_USERNAME=<your-klarna-username> \
KLARNA_PASSWORD=<your-klarna-password> \
npm run init:klarna
```

By default this creates sessions for all 19 countries. To target specific countries:

```bash
KLARNA_EXAMPLE_PROFILES=US,GB,DE npm run init:klarna
```

### What gets written to `.env.local`

One env var per country:

```
VITE_KLARNA_INIT_RESPONSE_US=<base64-encoded session>
VITE_KLARNA_INIT_RESPONSE_GB=<base64-encoded session>
VITE_KLARNA_INIT_RESPONSE_DE=<base64-encoded session>
# ... etc.
```

### Regional API URLs

Klarna's playground API is split by region. The script automatically picks the right base URL per country:

| Region | Countries | URL |
|--------|-----------|-----|
| EU | GB, DE, FR, NL, BE, IE, ES, IT, CH, AT, SE, NO, PL, CZ, RS | `api.playground.klarna.com` |
| NA | US, CA | `api-na.playground.klarna.com` |
| OC | AU, NZ | `api-oc.playground.klarna.com` |

Override individual regions with `KLARNA_API_URL_EU`, `KLARNA_API_URL_NA`, or `KLARNA_API_URL_OC`.

### Optional env vars

| Variable | Default | Description |
|----------|---------|-------------|
| `KLARNA_API_URL_EU` | `api.playground.klarna.com` | Override the EU region API URL |
| `KLARNA_API_URL_NA` | `api-na.playground.klarna.com` | Override the NA region API URL |
| `KLARNA_API_URL_OC` | `api-oc.playground.klarna.com` | Override the OC region API URL |
| `KLARNA_MERCHANT_URL_AUTHORIZATION` | `https://example.com/checkout/klarna/authorization` | Klarna authorization callback URL |
| `KLARNA_ORDER_AMOUNT` | per-country default | Order amount in minor units (e.g. 1749 = $17.49) |
| `KLARNA_ORDER_AMOUNT_XX` | `KLARNA_ORDER_AMOUNT` | Per-country override (e.g. `KLARNA_ORDER_AMOUNT_SE=14900`) |
| `KLARNA_ORDER_TAX_AMOUNT` | 0 | Tax amount in minor units |
| `KLARNA_ORDER_TAX_AMOUNT_XX` | `KLARNA_ORDER_TAX_AMOUNT` | Per-country tax override |
