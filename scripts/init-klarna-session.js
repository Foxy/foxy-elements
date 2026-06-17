import { loadEnv } from "vite";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE_PATH = resolve(PROJECT_ROOT, ".env.local");
const DEFAULT_AUTHORIZATION_URL =
  "https://example.com/checkout/klarna/authorization";

// Klarna's regional playground API base URLs.
// EU covers most markets; NA covers US/CA; OC covers AU/NZ.
const REGION_API_URLS = {
  EU: "https://api.playground.klarna.com",
  NA: "https://api-na.playground.klarna.com",
  OC: "https://api-oc.playground.klarna.com",
};

const PROFILE_CONFIGS = {
  US: {
    page: "us.html",
    countryCode: "US",
    locale: "en-US",
    currency: "USD",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "NA",
  },
  CA: {
    page: "ca.html",
    countryCode: "CA",
    locale: "en-CA",
    currency: "CAD",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "NA",
  },
  GB: {
    page: "gb.html",
    countryCode: "GB",
    locale: "en-GB",
    currency: "GBP",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  DE: {
    page: "de.html",
    countryCode: "DE",
    locale: "de-DE",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  FR: {
    page: "fr.html",
    countryCode: "FR",
    locale: "fr-FR",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  NL: {
    page: "nl.html",
    countryCode: "NL",
    locale: "nl-NL",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  BE: {
    page: "be.html",
    countryCode: "BE",
    locale: "nl-BE",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  IE: {
    page: "ie.html",
    countryCode: "IE",
    locale: "en-IE",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  ES: {
    page: "es.html",
    countryCode: "ES",
    locale: "es-ES",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  IT: {
    page: "it.html",
    countryCode: "IT",
    locale: "it-IT",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  CH: {
    page: "ch.html",
    countryCode: "CH",
    locale: "de-CH",
    currency: "CHF",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  AT: {
    page: "at.html",
    countryCode: "AT",
    locale: "de-AT",
    currency: "EUR",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "EU",
  },
  SE: {
    page: "se.html",
    countryCode: "SE",
    locale: "sv-SE",
    currency: "SEK",
    orderAmount: 14900,
    orderTaxAmount: 0,
    region: "EU",
  },
  NO: {
    page: "no.html",
    countryCode: "NO",
    locale: "nb-NO",
    currency: "NOK",
    orderAmount: 14900,
    orderTaxAmount: 0,
    region: "EU",
  },
  PL: {
    page: "pl.html",
    countryCode: "PL",
    locale: "pl-PL",
    currency: "PLN",
    orderAmount: 6900,
    orderTaxAmount: 0,
    region: "EU",
  },
  CZ: {
    page: "cz.html",
    countryCode: "CZ",
    locale: "cs-CZ",
    currency: "CZK",
    orderAmount: 39900,
    orderTaxAmount: 0,
    region: "EU",
  },
  RS: {
    page: "rs.html",
    countryCode: "RS",
    locale: "sr-RS",
    currency: "RSD",
    orderAmount: 174900,
    orderTaxAmount: 0,
    region: "EU",
  },
  AU: {
    page: "au.html",
    countryCode: "AU",
    locale: "en-AU",
    currency: "AUD",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "OC",
  },
  NZ: {
    page: "nz.html",
    countryCode: "NZ",
    locale: "en-NZ",
    currency: "NZD",
    orderAmount: 1749,
    orderTaxAmount: 0,
    region: "OC",
  },
};

function toNonEmptyString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function getRequiredString(env, name) {
  const value = toNonEmptyString(env[name]);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function getOptionalString(env, name, fallback) {
  return toNonEmptyString(env[name]) || fallback;
}

function getPositiveInteger(env, name, fallback) {
  const rawValue = toNonEmptyString(env[name]);

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function getNonNegativeInteger(env, name, fallback) {
  const rawValue = toNonEmptyString(env[name]);

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return value;
}

function ensureUrl(value, name) {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function loadRuntimeEnv() {
  return {
    ...loadEnv("development", PROJECT_ROOT, ""),
    ...process.env,
  };
}

function getProfiles(env) {
  const rawProfiles = getOptionalString(env, "KLARNA_EXAMPLE_PROFILES", "all");
  const profileKeys = Object.keys(PROFILE_CONFIGS);

  if (rawProfiles.toLowerCase() === "all") {
    return profileKeys;
  }

  const profiles = rawProfiles
    .split(",")
    .map((profile) => profile.trim().toUpperCase())
    .filter(Boolean);

  const unknownProfiles = profiles.filter(
    (profile) => !Object.hasOwn(PROFILE_CONFIGS, profile),
  );

  if (unknownProfiles.length > 0) {
    throw new Error(
      `Unknown KLARNA_EXAMPLE_PROFILES value: ${unknownProfiles.join(", ")}. ` +
        `Valid profiles: ${profileKeys.join(", ")}.`,
    );
  }

  if (profiles.length === 0) {
    throw new Error(
      "KLARNA_EXAMPLE_PROFILES must include at least one profile.",
    );
  }

  return profiles;
}

function getApiUrl(env, region) {
  // Per-region override takes highest priority.
  const regionOverride = toNonEmptyString(env[`KLARNA_API_URL_${region}`]);
  if (regionOverride) {
    return ensureUrl(regionOverride, `KLARNA_API_URL_${region}`);
  }

  // Region-specific default URL — ignore KLARNA_API_URL so an EU credential
  // stored under that key doesn't get applied to NA/OC profiles.
  return REGION_API_URLS[region] ?? REGION_API_URLS.EU;
}

function createKlarnaSessionRequest(env, profile) {
  const config = PROFILE_CONFIGS[profile];
  const username = getRequiredString(env, "KLARNA_USERNAME");
  const password = getRequiredString(env, "KLARNA_PASSWORD");
  const apiUrl = getApiUrl(env, config.region);
  const authorizationUrl = ensureUrl(
    getOptionalString(
      env,
      "KLARNA_MERCHANT_URL_AUTHORIZATION",
      DEFAULT_AUTHORIZATION_URL,
    ),
    "KLARNA_MERCHANT_URL_AUTHORIZATION",
  );

  const orderAmount = getPositiveInteger(
    env,
    `KLARNA_ORDER_AMOUNT_${profile}`,
    getPositiveInteger(env, "KLARNA_ORDER_AMOUNT", config.orderAmount),
  );
  const orderTaxAmount = getNonNegativeInteger(
    env,
    `KLARNA_ORDER_TAX_AMOUNT_${profile}`,
    getNonNegativeInteger(env, "KLARNA_ORDER_TAX_AMOUNT", config.orderTaxAmount),
  );

  if (orderTaxAmount > orderAmount) {
    throw new Error(
      `KLARNA_ORDER_TAX_AMOUNT for ${profile} must be less than or equal to the order amount.`,
    );
  }

  const netAmount = orderAmount - orderTaxAmount;
  const taxRate =
    netAmount > 0 ? Math.round((orderTaxAmount / netAmount) * 10000) : 0;

  return {
    profile,
    apiUrl,
    username,
    password,
    body: {
      acquiring_channel: "ECOMMERCE",
      intent: "buy",
      locale: config.locale,
      purchase_country: config.countryCode,
      purchase_currency: config.currency,
      order_amount: orderAmount,
      order_tax_amount: orderTaxAmount,
      merchant_urls: {
        authorization: authorizationUrl,
      },
      order_lines: [
        {
          type: "physical",
          reference: `foxy-elements-demo-${profile.toLowerCase()}`,
          name: "Demo Product",
          quantity: 1,
          unit_price: orderAmount,
          total_amount: orderAmount,
          total_tax_amount: orderTaxAmount,
          tax_rate: taxRate,
        },
      ],
    },
  };
}

function tryParseJson(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function summarizeKlarnaError(status, payload, apiUrl) {
  if (!payload || typeof payload !== "object") {
    return `Klarna request failed with HTTP ${status}.`;
  }

  const lines = [`Klarna request failed with HTTP ${status}.`];

  if (typeof payload.error_code === "string") {
    lines.push(`error_code: ${payload.error_code}`);
  }

  if (typeof payload.correlation_id === "string") {
    lines.push(`correlation_id: ${payload.correlation_id}`);
  }

  if (
    Array.isArray(payload.error_messages) &&
    payload.error_messages.length > 0
  ) {
    lines.push(`error_messages: ${payload.error_messages.join(" | ")}`);
  }

  if (status === 403 && payload.error_code === "INVALID_OPERATION") {
    lines.push(
      `hint: INVALID_OPERATION on create_session means the MID is not activated for this region. Verify your Klarna playground credentials support this endpoint (${apiUrl}).`,
    );
  }

  if (
    status === 400 &&
    payload.error_code === "BAD_VALUE" &&
    Array.isArray(payload.error_messages) &&
    payload.error_messages.some((m) => String(m).includes("purchase_currency"))
  ) {
    lines.push(
      `hint: BAD_VALUE on purchase_currency usually means the MID does not support this currency. The EU playground endpoint typically only accepts EUR.`,
    );
  }

  return lines.join("\n");
}

async function initiateKlarnaSession(config) {
  const endpoint = new URL(
    "payments/v1/sessions",
    ensureTrailingSlash(config.apiUrl),
  );
  const authorization = Buffer.from(
    `${config.username}:${config.password}`,
  ).toString("base64");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.body),
  });
  const responseText = await response.text();
  const payload = tryParseJson(responseText);

  if (!response.ok) {
    throw new Error(
      summarizeKlarnaError(response.status, payload, config.apiUrl),
    );
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Klarna returned a non-JSON session response.");
  }

  return payload;
}

function validateKlarnaSessionResponse(payload) {
  const sessionId = toNonEmptyString(payload.session_id);
  const clientToken = toNonEmptyString(payload.client_token);
  const categories = Array.isArray(payload.payment_method_categories)
    ? payload.payment_method_categories
    : [];

  if (!sessionId || !clientToken) {
    throw new Error(
      "Klarna session response is missing session_id or client_token.",
    );
  }

  if (categories.length === 0) {
    throw new Error(
      "Klarna session has no payment_method_categories — the MID may not be activated for this market.",
    );
  }

  return { sessionId, categories };
}

async function upsertEnvVars(filePath, entries) {
  let content = "";

  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code !== "ENOENT") {
      throw error;
    }
  }

  const names = new Set(entries.map(([name]) => name));
  const lines = content ? content.split(/\r?\n/) : [];
  const filteredLines = lines.filter((line) => {
    const equalsIndex = line.indexOf("=");
    const name = equalsIndex >= 0 ? line.slice(0, equalsIndex) : line;
    return !names.has(name);
  });

  while (filteredLines.length > 0 && filteredLines.at(-1) === "") {
    filteredLines.pop();
  }

  for (const [name, value] of entries) {
    filteredLines.push(`${name}=${value}`);
  }

  filteredLines.push("");
  await writeFile(filePath, filteredLines.join("\n"), "utf8");
}

async function main() {
  const env = loadRuntimeEnv();
  const profiles = getProfiles(env);
  const envEntries = [];
  const summaries = [];

  const failures = [];

  for (const profile of profiles) {
    try {
      const request = createKlarnaSessionRequest(env, profile);
      const session = await initiateKlarnaSession(request);
      const { sessionId, categories } = validateKlarnaSessionResponse(session);
      const encodedSession = Buffer.from(
        JSON.stringify(session),
        "utf8",
      ).toString("base64");

      envEntries.push([`VITE_KLARNA_INIT_RESPONSE_${profile}`, encodedSession]);
      summaries.push({ profile, sessionId, categories });
    } catch (error) {
      failures.push({
        profile,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await upsertEnvVars(ENV_FILE_PATH, envEntries);

  console.log(`Stored Klarna demo session values in ${ENV_FILE_PATH}`);
  console.log("");

  for (const { profile, sessionId, categories } of summaries) {
    const config = PROFILE_CONFIGS[profile];
    const categoryNames = categories
      .map((c) => {
        const identifier = toNonEmptyString(c?.identifier) || "unknown";
        const name = toNonEmptyString(c?.name) || "unknown";
        return `${identifier} (${name})`;
      })
      .join(", ");

    console.log(
      `${profile} (${config.locale}, ${config.currency}): session_id=${sessionId} categories=${categoryNames}`,
    );
  }

  if (failures.length > 0) {
    console.log("");
    console.error(`Failed profiles (${failures.length}):`);
    for (const { profile, message } of failures) {
      console.error(`  ${profile}: ${message}`);
    }

    if (summaries.length === 0) {
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
