import { loadEnv } from "vite";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE_PATH = resolve(PROJECT_ROOT, ".env.local");
const DEFAULT_ENVIRONMENT = "test";
const DEFAULT_TEST_SESSIONS_URL =
  "https://checkout-test.adyen.com/v71/sessions";
const DEFAULT_RETURN_URL_BASE =
  "https://elements.foxy.test/examples/adyen_embedded";
const DEFAULT_REFERENCE_PREFIX = "foxy-elements-demo";
const BLOCKED_PAYMENT_METHODS = [
  "ratepay",
  "ratepay_directdebit",
  "klarna",
  "klarna_account",
  "klarna_paynow",
  "paypal",
];

const PROFILE_CONFIGS = {
  US: {
    page: "us.html",
    countryCode: "US",
    shopperLocale: "en-US",
    currency: "USD",
    value: 1749,
  },
  CA: {
    page: "ca.html",
    countryCode: "CA",
    shopperLocale: "en-CA",
    currency: "CAD",
    value: 1749,
  },
  DE: {
    page: "de.html",
    countryCode: "DE",
    shopperLocale: "de-DE",
    currency: "EUR",
    value: 1749,
  },
  NL: {
    page: "nl.html",
    countryCode: "NL",
    shopperLocale: "nl-NL",
    currency: "EUR",
    value: 1749,
  },
  BE: {
    page: "be.html",
    countryCode: "BE",
    shopperLocale: "nl-BE",
    currency: "EUR",
    value: 1749,
  },
  IE: {
    page: "ie.html",
    countryCode: "IE",
    shopperLocale: "en-IE",
    currency: "EUR",
    value: 1749,
  },
  ES: {
    page: "es.html",
    countryCode: "ES",
    shopperLocale: "es-ES",
    currency: "EUR",
    value: 1749,
  },
  FR: {
    page: "fr.html",
    countryCode: "FR",
    shopperLocale: "fr-FR",
    currency: "EUR",
    value: 1749,
  },
  IT: {
    page: "it.html",
    countryCode: "IT",
    shopperLocale: "it-IT",
    currency: "EUR",
    value: 1749,
  },
  GB: {
    page: "gb.html",
    countryCode: "GB",
    shopperLocale: "en-GB",
    currency: "GBP",
    value: 1749,
  },
  CH: {
    page: "ch.html",
    countryCode: "CH",
    shopperLocale: "de-CH",
    currency: "CHF",
    value: 1749,
  },
  AU: {
    page: "au.html",
    countryCode: "AU",
    shopperLocale: "en-AU",
    currency: "AUD",
    value: 1749,
  },
  NZ: {
    page: "nz.html",
    countryCode: "NZ",
    shopperLocale: "en-NZ",
    currency: "NZD",
    value: 1749,
  },
  SE: {
    page: "se.html",
    countryCode: "SE",
    shopperLocale: "sv-SE",
    currency: "SEK",
    value: 14900,
  },
  PL: {
    page: "pl.html",
    countryCode: "PL",
    shopperLocale: "pl-PL",
    currency: "PLN",
    value: 6900,
  },
  CZ: {
    page: "cz.html",
    countryCode: "CZ",
    shopperLocale: "cs-CZ",
    currency: "CZK",
    value: 39900,
  },
  RS: {
    page: "rs.html",
    countryCode: "RS",
    shopperLocale: "sr-RS",
    currency: "RSD",
    value: 174900,
  },
  NO: {
    page: "no.html",
    countryCode: "NO",
    shopperLocale: "nb-NO",
    currency: "NOK",
    value: 14900,
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

function getOptionalProfileString(env, profile, name, fallback) {
  return (
    toNonEmptyString(env[`ADYEN_${profile}_${name}`]) ||
    toNonEmptyString(env[`ADYEN_${name}_${profile}`]) ||
    toNonEmptyString(env[`VITE_ADYEN_${name}_${profile}`]) ||
    toNonEmptyString(env[`ADYEN_${name}`]) ||
    toNonEmptyString(env[`VITE_ADYEN_${name}`]) ||
    fallback
  );
}

function getClientKey(env) {
  return (
    toNonEmptyString(env.ADYEN_CLIENT_KEY) ||
    toNonEmptyString(env.VITE_ADYEN_CLIENT_KEY) ||
    null
  );
}

function getProfilePositiveInteger(env, profile, name, fallback) {
  const rawValue = getOptionalProfileString(env, profile, name, null);

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} for ${profile} must be a positive integer.`);
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

function loadRuntimeEnv() {
  return {
    ...loadEnv("development", PROJECT_ROOT, ""),
    ...process.env,
  };
}

function getSessionsUrl(env, environment) {
  const configuredUrl = toNonEmptyString(env.ADYEN_CHECKOUT_API_URL);

  if (configuredUrl) {
    return ensureUrl(configuredUrl, "ADYEN_CHECKOUT_API_URL");
  }

  if (environment === "test") {
    return DEFAULT_TEST_SESSIONS_URL;
  }

  throw new Error(
    "ADYEN_CHECKOUT_API_URL is required when ADYEN_ENVIRONMENT is not test.",
  );
}

function getProfiles(env) {
  const rawProfiles = getOptionalString(env, "ADYEN_EXAMPLE_PROFILES", "all");
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
      `Unknown ADYEN_EXAMPLE_PROFILES value: ${unknownProfiles.join(", ")}.`,
    );
  }

  if (profiles.length === 0) {
    throw new Error(
      "ADYEN_EXAMPLE_PROFILES must include at least one profile.",
    );
  }

  return profiles;
}

function createAdyenSessionRequest(
  env,
  profile,
  sessionsUrl,
  environment,
  clientKey,
) {
  const config = PROFILE_CONFIGS[profile];
  const merchantAccount = getRequiredString(env, "ADYEN_MERCHANT_ACCOUNT");
  const apiKey = getRequiredString(env, "ADYEN_API_KEY");

  if (!clientKey) {
    throw new Error("ADYEN_CLIENT_KEY is required.");
  }

  const returnUrlBase = ensureUrl(
    getOptionalString(env, "ADYEN_RETURN_URL_BASE", DEFAULT_RETURN_URL_BASE),
    "ADYEN_RETURN_URL_BASE",
  ).replace(/\/+$/, "");
  const referencePrefix = getOptionalString(
    env,
    "ADYEN_REFERENCE_PREFIX",
    DEFAULT_REFERENCE_PREFIX,
  );
  const value = getProfilePositiveInteger(
    env,
    profile,
    "AMOUNT_VALUE",
    config.value,
  );
  const currency = getOptionalProfileString(
    env,
    profile,
    "CURRENCY",
    config.currency,
  ).toUpperCase();
  const countryCode = getOptionalProfileString(
    env,
    profile,
    "COUNTRY_CODE",
    config.countryCode,
  ).toUpperCase();
  const shopperLocale = getOptionalProfileString(
    env,
    profile,
    "SHOPPER_LOCALE",
    config.shopperLocale,
  );
  const reference = `${referencePrefix}-${profile.toLowerCase()}-${Date.now()}`;
  const body = {
    merchantAccount,
    reference,
    amount: {
      currency,
      value,
    },
    countryCode,
    shopperLocale,
    returnUrl: `${returnUrlBase}/${config.page}`,
    blockedPaymentMethods: BLOCKED_PAYMENT_METHODS,
    // Required by BNPL methods (Zip, Afterpay, etc.) to appear in session paymentMethodsResponse.
    lineItems: [
      {
        id: "demo-001",
        description: "Demo product",
        quantity: 1,
        amountIncludingTax: value,
        amountExcludingTax: value,
        taxAmount: 0,
        taxPercentage: 0,
      },
    ],
  };
  const shopperEmail = getOptionalString(env, "ADYEN_SHOPPER_EMAIL", null);
  const shopperReference = getOptionalString(
    env,
    "ADYEN_SHOPPER_REFERENCE",
    null,
  );

  if (shopperEmail) {
    body.shopperEmail = shopperEmail;
  }

  if (shopperReference) {
    body.shopperReference = shopperReference;
    body.recurringProcessingModel = getOptionalString(
      env,
      "ADYEN_RECURRING_PROCESSING_MODEL",
      "CardOnFile",
    );
    body.storePaymentMethodMode = getOptionalString(
      env,
      "ADYEN_STORE_PAYMENT_METHOD_MODE",
      "askForConsent",
    );
  }

  return {
    profile,
    environment,
    sessionsUrl,
    apiKey,
    clientKey,
    body,
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

function summarizeAdyenError(status, payload) {
  if (!payload || typeof payload !== "object") {
    return `Adyen request failed with HTTP ${status}.`;
  }

  const lines = [`Adyen request failed with HTTP ${status}.`];

  if (typeof payload.errorCode === "string") {
    lines.push(`errorCode: ${payload.errorCode}`);
  }

  if (typeof payload.message === "string") {
    lines.push(`message: ${payload.message}`);
  }

  if (typeof payload.errorType === "string") {
    lines.push(`errorType: ${payload.errorType}`);
  }

  if (typeof payload.pspReference === "string") {
    lines.push(`pspReference: ${payload.pspReference}`);
  }

  if (
    payload.errorCode === "192" &&
    typeof payload.message === "string" &&
    /merchantAccount/i.test(payload.message)
  ) {
    lines.push(
      "hint: Check that ADYEN_MERCHANT_ACCOUNT is the merchant account code for the same Adyen environment and API credential used by this script.",
    );
  }

  return lines.join("\n");
}

async function initiateAdyenSession(config) {
  const response = await fetch(config.sessionsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-API-key": config.apiKey,
    },
    body: JSON.stringify(config.body),
  });
  const responseText = await response.text();
  const payload = tryParseJson(responseText);

  if (!response.ok) {
    throw new Error(summarizeAdyenError(response.status, payload));
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Adyen returned a non-JSON session response.");
  }

  return payload;
}

function validateAdyenSessionResponse(payload) {
  const sessionId = toNonEmptyString(payload.id);
  const sessionData = toNonEmptyString(payload.sessionData);

  if (!sessionId || !sessionData) {
    throw new Error("Adyen session response must include id and sessionData.");
  }

  return { sessionId, sessionData };
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
  const environment = (
    toNonEmptyString(env.ADYEN_ENVIRONMENT) ||
    toNonEmptyString(env.VITE_ADYEN_ENVIRONMENT) ||
    DEFAULT_ENVIRONMENT
  ).toLowerCase();
  const sessionsUrl = getSessionsUrl(env, environment);
  const profiles = getProfiles(env);
  const clientKey = getClientKey(env);

  if (!clientKey) {
    throw new Error("ADYEN_CLIENT_KEY or VITE_ADYEN_CLIENT_KEY is required.");
  }

  const envEntries = [
    ["VITE_ADYEN_ENVIRONMENT", environment],
    ["VITE_ADYEN_CLIENT_KEY", clientKey],
  ];
  const summaries = [];

  for (const profile of profiles) {
    const request = createAdyenSessionRequest(
      env,
      profile,
      sessionsUrl,
      environment,
      clientKey,
    );
    const session = await initiateAdyenSession(request);
    const { sessionId, sessionData } = validateAdyenSessionResponse(session);

    envEntries.push(
      [`VITE_ADYEN_SESSION_ID_${profile}`, sessionId],
      [`VITE_ADYEN_SESSION_DATA_${profile}`, sessionData],
    );
    summaries.push({
      profile,
      sessionId,
      countryCode: request.body.countryCode,
      currency: request.body.amount.currency,
      value: request.body.amount.value,
    });
  }

  await upsertEnvVars(ENV_FILE_PATH, envEntries);

  console.log(`Stored Adyen demo session values in ${ENV_FILE_PATH}`);

  for (const summary of summaries) {
    console.log(
      `${summary.profile}: session_id=${summary.sessionId} country=${summary.countryCode} amount=${summary.value} ${summary.currency}`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
