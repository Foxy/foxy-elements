import { describe, expect, it } from "vitest";

import { parseKlarnaInitResponse } from "./klarna-init-response";

const VALID_KLARNA_RESPONSE = {
  session_id: "klarna-session-id",
  client_token: "klarna-client-token",
  payment_method_categories: [
    {
      identifier: "pay_in_4",
      name: "Pay in 4",
      asset_urls: {
        standard: "https://cdn.example.test/klarna/pay-in-4.svg",
      },
    },
  ],
};

describe("parseKlarnaInitResponse", () => {
  it("returns null for malformed JSON", () => {
    expect(parseKlarnaInitResponse("{")).toBeNull();
  });

  it("returns null when required Klarna fields are missing", () => {
    expect(
      parseKlarnaInitResponse(
        JSON.stringify({
          session_id: "klarna-session-id",
          payment_method_categories: [],
        }),
      ),
    ).toBeNull();
  });

  it("normalizes a valid Klarna session response into a selector payment option", () => {
    const response = parseKlarnaInitResponse(
      JSON.stringify(VALID_KLARNA_RESPONSE),
    );

    expect(response).toEqual({
      type: "klarna",
      gateway: "klarna",
      session_id: "klarna-session-id",
      client_token: "klarna-client-token",
      payment_method_categories: [
        {
          identifier: "pay_in_4",
          name: "Pay in 4",
          asset_urls: {
            descriptive: "https://cdn.example.test/klarna/pay-in-4.svg",
            standard: "https://cdn.example.test/klarna/pay-in-4.svg",
          },
        },
      ],
    });
  });

  it("parses a double-encoded Klarna response string", () => {
    expect(
      parseKlarnaInitResponse(
        JSON.stringify(JSON.stringify(VALID_KLARNA_RESPONSE)),
      ),
    )?.toMatchObject({
      session_id: "klarna-session-id",
      client_token: "klarna-client-token",
    });
  });

  it("parses a base64-encoded Klarna response string", () => {
    const encoded = btoa(JSON.stringify(VALID_KLARNA_RESPONSE));

    expect(parseKlarnaInitResponse(encoded))?.toMatchObject({
      session_id: "klarna-session-id",
      client_token: "klarna-client-token",
    });
  });
});
