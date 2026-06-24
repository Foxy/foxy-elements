import { loadEnv } from "vite";

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE_PATH = resolve(PROJECT_ROOT, ".env.local");

const API_BASE_URLS = {
  sandbox: "https://sandbox.gateway.sezzle.com",
  live: "https://gateway.sezzle.com",
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

function loadRuntimeEnv() {
  return {
    ...loadEnv("development", PROJECT_ROOT, ""),
    ...process.env,
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

function summarizeSezzleError(status, responseText, payload) {
  const lines = [`Sezzle request failed with HTTP ${status}.`];

  if (payload && typeof payload === "object") {
    if (typeof payload.message === "string") {
      lines.push(`message: ${payload.message}`);
    }

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      lines.push(`errors: ${payload.errors.join(" | ")}`);
    }

    if (lines.length === 1 && responseText) {
      lines.push(`response: ${responseText}`);
    }
  } else if (responseText) {
    lines.push(`response: ${responseText}`);
  }

  return lines.join("\n");
}

async function getSezzleToken(apiBaseUrl, publicKey, privateKey) {
  const endpoint = new URL("/v2/authentication", apiBaseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_key: publicKey, private_key: privateKey }),
  });

  const responseText = await response.text();
  const payload = tryParseJson(responseText);

  if (!response.ok) {
    throw new Error(summarizeSezzleError(response.status, responseText, payload));
  }

  const token = toNonEmptyString(payload?.token);
  if (!token) {
    throw new Error("Sezzle authentication response is missing a token.");
  }

  return token;
}

async function createSezzleSession(apiBaseUrl, token, sessionBody) {
  const endpoint = new URL("/v2/session", apiBaseUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sessionBody),
  });

  const responseText = await response.text();
  const payload = tryParseJson(responseText);

  if (!response.ok) {
    throw new Error(summarizeSezzleError(response.status, responseText, payload));
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  return payload;
}

const CHECKOUT_BASE_URLS = {
  sandbox: "https://sandbox.checkout.sezzle.com",
  live: "https://checkout.sezzle.com",
};

function extractCheckoutUrl(sessionPayload, apiMode) {
  const links = Array.isArray(sessionPayload?.links) ? sessionPayload.links : [];

  const checkoutLink = links.find(
    (l) => typeof l === "object" && l !== null && l.rel === "checkout",
  );
  if (checkoutLink?.href) {
    const url = toNonEmptyString(checkoutLink.href);
    if (url) return url;
  }

  // Sezzle sandbox only returns a "self" link; construct the checkout URL from the UUID.
  const uuid =
    toNonEmptyString(sessionPayload?.uuid) ??
    (() => {
      const selfLink = links.find(
        (l) => typeof l === "object" && l !== null && l.rel === "self",
      );
      const href = toNonEmptyString(selfLink?.href);
      return href ? href.split("/").at(-1) : null;
    })();

  if (!uuid) {
    throw new Error(
      `Could not determine Sezzle checkout URL. Full session payload: ${JSON.stringify(sessionPayload)}`,
    );
  }

  return `${CHECKOUT_BASE_URLS[apiMode]}/?id=${uuid}`;
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

  const publicKey = getRequiredString(env, "SEZZLE_PUBLIC_KEY");
  const privateKey = getRequiredString(env, "SEZZLE_PRIVATE_KEY");
  const apiMode = getOptionalString(env, "SEZZLE_API_MODE", "sandbox");
  const authOnly =
    getOptionalString(env, "SEZZLE_AUTH_ONLY", "false") === "true";
  const orderAmountCents = getPositiveInteger(
    env,
    "SEZZLE_ORDER_AMOUNT_CENTS",
    1749,
  );
  const cancelUrl = getOptionalString(
    env,
    "SEZZLE_CANCEL_URL",
    "https://elements.foxy.test/examples/default/sezzle.html",
  );
  const completeUrl = getOptionalString(
    env,
    "SEZZLE_COMPLETE_URL",
    "https://elements.foxy.test/examples/default/sezzle.html",
  );

  if (apiMode !== "sandbox" && apiMode !== "live") {
    throw new Error(
      'SEZZLE_API_MODE must be "sandbox" or "live".',
    );
  }

  const apiBaseUrl = API_BASE_URLS[apiMode];

  console.log(`Using Sezzle ${apiMode} API (${apiBaseUrl})`);

  const token = await getSezzleToken(apiBaseUrl, publicKey, privateKey);

  const sessionBody = {
    cancel_url: { href: cancelUrl, method: "GET" },
    complete_url: { href: completeUrl, method: "GET" },
    order: {
      intent: "AUTH",
      reference_id: `foxy-elements-demo-${Date.now()}`,
      description: "Foxy Elements demo order",
      requires_shipping_info: false,
      items: [
        {
          name: "Margherita Pizza",
          sku: "pizza-margherita",
          quantity: 1,
          price: {
            amount_in_cents: orderAmountCents,
            currency: "USD",
          },
        },
      ],
      order_amount: {
        amount_in_cents: orderAmountCents,
        currency: "USD",
      },
    },
    merchant_completes: authOnly,
  };

  const sessionPayload = await createSezzleSession(apiBaseUrl, token, sessionBody);
  const checkoutUrl = extractCheckoutUrl(sessionPayload, apiMode);

  await upsertEnvVars(ENV_FILE_PATH, [
    ["VITE_SEZZLE_PUBLIC_KEY", publicKey],
    ["VITE_SEZZLE_CHECKOUT_URL", checkoutUrl],
  ]);

  console.log(`Stored Sezzle demo session values in ${ENV_FILE_PATH}`);
  console.log("");
  console.log(`checkout_url: ${checkoutUrl}`);
  if (authOnly) {
    console.log("intent: AUTH (merchant_completes=true)");
  } else {
    console.log("intent: AUTH_CAPTURE (merchant_completes=false)");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
