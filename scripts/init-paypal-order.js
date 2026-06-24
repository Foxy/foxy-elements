import { loadEnv } from "vite";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE_PATH = resolve(PROJECT_ROOT, ".env.local");
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

const PROFILE_CONFIGS = {
  US: { countryCode: "US", currency: "USD", amount: "17.49" },
  AT: { countryCode: "AT", currency: "EUR", amount: "17.49" },
  BE: { countryCode: "BE", currency: "EUR", amount: "17.49" },
  NL: { countryCode: "NL", currency: "EUR", amount: "17.49" },
  PL: { countryCode: "PL", currency: "PLN", amount: "17.49" },
};

function toNonEmptyString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function getOptionalString(env, name, fallback) {
  return toNonEmptyString(env[name]) || fallback;
}

function loadRuntimeEnv() {
  return {
    ...loadEnv("development", PROJECT_ROOT, ""),
    ...process.env,
  };
}

function getProfiles(env) {
  const rawProfiles = getOptionalString(env, "PAYPAL_EXAMPLE_PROFILES", "all");
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
      `Unknown PAYPAL_EXAMPLE_PROFILES value: ${unknownProfiles.join(", ")}. ` +
        `Valid profiles: ${profileKeys.join(", ")}.`,
    );
  }

  if (profiles.length === 0) {
    throw new Error(
      "PAYPAL_EXAMPLE_PROFILES must include at least one profile.",
    );
  }

  return profiles;
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

async function getAccessToken(clientId, clientSecret) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const payload = tryParseJson(await response.text());

  if (!response.ok) {
    const message =
      typeof payload?.error_description === "string"
        ? payload.error_description
        : `HTTP ${response.status}`;
    throw new Error(`PayPal auth failed: ${message}`);
  }

  const accessToken = toNonEmptyString(payload?.access_token);

  if (!accessToken) {
    throw new Error("PayPal auth response did not include an access_token.");
  }

  return accessToken;
}

async function createOrder(accessToken, profile) {
  const config = PROFILE_CONFIGS[profile];

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: config.currency,
            value: config.amount,
          },
        },
      ],
    }),
  });

  const payload = tryParseJson(await response.text());

  if (!response.ok) {
    const details = Array.isArray(payload?.details)
      ? payload.details.map((d) => d.description).filter(Boolean).join("; ")
      : null;
    const message = details || `HTTP ${response.status}`;
    throw new Error(`PayPal order creation failed: ${message}`);
  }

  const orderId = toNonEmptyString(payload?.id);

  if (!orderId) {
    throw new Error("PayPal order response did not include an id.");
  }

  return orderId;
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
  const tokenCache = new Map();

  for (const profile of profiles) {
    const config = PROFILE_CONFIGS[profile];
    const clientId = toNonEmptyString(env[`VITE_PAYPAL_SANDBOX_CLIENT_ID_${profile}`]);
    const clientSecret = toNonEmptyString(env[`PAYPAL_SANDBOX_CLIENT_SECRET_${profile}`]);

    if (!clientId || !clientSecret) {
      const missing = [
        !clientId && `VITE_PAYPAL_SANDBOX_CLIENT_ID_${profile}`,
        !clientSecret && `PAYPAL_SANDBOX_CLIENT_SECRET_${profile}`,
      ]
        .filter(Boolean)
        .join(", ");

      failures.push({ profile, message: `Missing credentials: ${missing}` });
      continue;
    }

    try {
      const cacheKey = `${clientId}:${clientSecret}`;
      let accessToken = tokenCache.get(cacheKey);

      if (!accessToken) {
        console.log(`Authenticating ${profile} (${clientId.slice(0, 8)}...)...`);
        accessToken = await getAccessToken(clientId, clientSecret);
        tokenCache.set(cacheKey, accessToken);
      }

      const orderId = await createOrder(accessToken, profile);
      envEntries.push([`VITE_PAYPAL_SANDBOX_ORDER_ID_${profile}`, orderId]);
      summaries.push({ profile, orderId, config });
    } catch (error) {
      failures.push({
        profile,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (envEntries.length > 0) {
    await upsertEnvVars(ENV_FILE_PATH, envEntries);
    console.log(`\nStored PayPal sandbox order IDs in ${ENV_FILE_PATH}`);
    console.log("");
  }

  for (const { profile, orderId, config } of summaries) {
    console.log(
      `${profile} (${config.currency} ${config.amount}): order_id=${orderId}`,
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
