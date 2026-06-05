import type { PaymentMethodSelectorKlarnaCategory } from "@/elements/foxy-payment-method-selector/types";

type KlarnaServerPaymentOption = {
  type: "klarna";
  gateway: "klarna";
  session_id: string;
  client_token: string;
  payment_method_categories: PaymentMethodSelectorKlarnaCategory[];
};

type BufferLike = {
  from(
    input: string,
    encoding: "base64",
  ): { toString(encoding: "utf8"): string };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeKlarnaCategory(
  value: unknown,
): PaymentMethodSelectorKlarnaCategory | null {
  const category = asRecord(value);
  const assetUrls = asRecord(category?.asset_urls);
  const identifier = toNonEmptyString(category?.identifier);
  const name = toNonEmptyString(category?.name);
  const descriptive = toNonEmptyString(assetUrls?.descriptive);
  const standard = toNonEmptyString(assetUrls?.standard);

  if (!identifier || !name || (!descriptive && !standard)) {
    return null;
  }

  return {
    identifier,
    name,
    asset_urls: {
      descriptive: descriptive || standard || "",
      standard: standard || descriptive || "",
    },
  };
}

function parseKlarnaInitPayload(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "string") {
      return parseKlarnaInitPayload(parsed);
    }

    return asRecord(parsed);
  } catch {
    return null;
  }
}

function decodeBase64Utf8(value: string): string | null {
  if (typeof globalThis.atob === "function") {
    try {
      const binary = globalThis.atob(value);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }

  const maybeBuffer = (
    globalThis as typeof globalThis & { Buffer?: BufferLike }
  ).Buffer;

  if (!maybeBuffer) {
    return null;
  }

  try {
    return maybeBuffer.from(value, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function parseKlarnaInitResponse(
  raw: string | null | undefined,
): KlarnaServerPaymentOption | null {
  const source = toNonEmptyString(raw);

  if (!source) {
    return null;
  }

  const payload =
    parseKlarnaInitPayload(source) ??
    (() => {
      const decoded = decodeBase64Utf8(source);
      return decoded ? parseKlarnaInitPayload(decoded) : null;
    })();

  const sessionId = toNonEmptyString(payload?.session_id);
  const clientToken = toNonEmptyString(payload?.client_token);
  const paymentMethodCategories = Array.isArray(
    payload?.payment_method_categories,
  )
    ? payload.payment_method_categories.flatMap((entry) => {
        const category = normalizeKlarnaCategory(entry);
        return category ? [category] : [];
      })
    : [];

  if (!sessionId || !clientToken || paymentMethodCategories.length === 0) {
    return null;
  }

  return {
    type: "klarna",
    gateway: "klarna",
    session_id: sessionId,
    client_token: clientToken,
    payment_method_categories: paymentMethodCategories,
  };
}

export function getKlarnaInitPaymentOptionFromEnv(
  countryCode?: string,
): KlarnaServerPaymentOption | null {
  if (countryCode) {
    const key = `VITE_KLARNA_INIT_RESPONSE_${countryCode.toUpperCase()}`;
    return parseKlarnaInitResponse(
      (import.meta.env as Record<string, string | undefined>)[key],
    );
  }

  return parseKlarnaInitResponse(import.meta.env.VITE_KLARNA_INIT_RESPONSE);
}
