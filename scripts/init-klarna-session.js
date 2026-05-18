import { loadEnv } from "vite";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE_PATH = resolve(PROJECT_ROOT, ".env.local");
const KLARNA_ENV_KEY = "VITE_KLARNA_INIT_RESPONSE";
const DEFAULT_API_URL = "https://api.playground.klarna.com";
const DEFAULT_AUTHORIZATION_URL =
  "https://example.com/checkout/klarna/authorization";
const DEFAULT_LOCALE = "en-US";
const DEFAULT_PURCHASE_COUNTRY = "US";
const DEFAULT_PURCHASE_CURRENCY = "USD";
const DEFAULT_ORDER_AMOUNT = 2500;
const DEFAULT_ORDER_TAX_AMOUNT = 500;

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

function createKlarnaSessionRequest(env) {
  const apiUrl = ensureUrl(
    getOptionalString(env, "KLARNA_API_URL", DEFAULT_API_URL),
    "KLARNA_API_URL",
  );
  const username = getRequiredString(env, "KLARNA_USERNAME");
  const password = getRequiredString(env, "KLARNA_PASSWORD");
  const authorizationUrl = ensureUrl(
    getOptionalString(
      env,
      "KLARNA_MERCHANT_URL_AUTHORIZATION",
      DEFAULT_AUTHORIZATION_URL,
    ),
    "KLARNA_MERCHANT_URL_AUTHORIZATION",
  );
  const locale = getOptionalString(env, "KLARNA_LOCALE", DEFAULT_LOCALE);
  const purchaseCountry = getOptionalString(
    env,
    "KLARNA_PURCHASE_COUNTRY",
    DEFAULT_PURCHASE_COUNTRY,
  );
  const purchaseCurrency = getOptionalString(
    env,
    "KLARNA_PURCHASE_CURRENCY",
    DEFAULT_PURCHASE_CURRENCY,
  );
  const orderAmount = getPositiveInteger(
    env,
    "KLARNA_ORDER_AMOUNT",
    DEFAULT_ORDER_AMOUNT,
  );
  const orderTaxAmount = getNonNegativeInteger(
    env,
    "KLARNA_ORDER_TAX_AMOUNT",
    DEFAULT_ORDER_TAX_AMOUNT,
  );

  if (orderTaxAmount > orderAmount) {
    throw new Error(
      "KLARNA_ORDER_TAX_AMOUNT must be less than or equal to KLARNA_ORDER_AMOUNT.",
    );
  }

  const netAmount = orderAmount - orderTaxAmount;
  const taxRate =
    netAmount > 0 ? Math.round((orderTaxAmount / netAmount) * 10000) : 0;

  return {
    apiUrl,
    username,
    password,
    body: {
      acquiring_channel: "ECOMMERCE",
      intent: "buy",
      locale,
      purchase_country: purchaseCountry,
      purchase_currency: purchaseCurrency,
      order_amount: orderAmount,
      order_tax_amount: orderTaxAmount,
      merchant_urls: {
        authorization: authorizationUrl,
      },
      order_lines: [
        {
          type: "physical",
          reference: "storybook-klarna-session",
          name: "Storybook Klarna Test Order",
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

  if (
    status === 403 &&
    payload.error_code === "INVALID_OPERATION" &&
    typeof apiUrl === "string"
  ) {
    lines.push(
      `hint: INVALID_OPERATION on create_session usually means the MID is not enabled for this endpoint or region. Check KLARNA_API_URL for a region mismatch.`,
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

  if (!sessionId || !clientToken || categories.length === 0) {
    throw new Error(
      "Klarna session response must include session_id, client_token, and payment_method_categories.",
    );
  }

  return {
    sessionId,
    categoryCount: categories.length,
  };
}

async function upsertEnvVar(filePath, name, value) {
  let content = "";

  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code !== "ENOENT") {
      throw error;
    }
  }

  const nextLine = `${name}=${value}`;
  const lines = content ? content.split(/\r?\n/) : [];
  const filteredLines = lines.filter((line) => !line.startsWith(`${name}=`));

  while (filteredLines.length > 0 && filteredLines.at(-1) === "") {
    filteredLines.pop();
  }

  filteredLines.push(nextLine, "");
  await writeFile(filePath, filteredLines.join("\n"), "utf8");
}

async function main() {
  const env = loadRuntimeEnv();
  const request = createKlarnaSessionRequest(env);
  const session = await initiateKlarnaSession(request);
  const summary = validateKlarnaSessionResponse(session);
  const encodedSession = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64",
  );

  await upsertEnvVar(ENV_FILE_PATH, KLARNA_ENV_KEY, encodedSession);

  const categories = session.payment_method_categories
    .map((category) => {
      const identifier = toNonEmptyString(category?.identifier) || "unknown";
      const name = toNonEmptyString(category?.name) || "unknown";
      return `${identifier} (${name})`;
    })
    .join(", ");

  console.log(`Stored ${KLARNA_ENV_KEY} in ${ENV_FILE_PATH}`);
  console.log(`session_id: ${summary.sessionId}`);
  console.log(`payment_method_categories: ${categories}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
