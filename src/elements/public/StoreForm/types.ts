import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

export type Data = Resource<Rels.Store>;

// TODO add this to SDK
export type ParsedWebhookKey = {
  cart_signing: string;
  xml_datafeed: string;
  api_legacy: string;
  sso: string;
};

// TODO add this to SDK
export type ParsedSmtpConfig = {
  username: string;
  password: string;
  security: string;
  host: string;
  port: string;
};

// TODO add this to SDK
export type ParsedCustomDisplayIdConfig = {
  enabled: boolean;
  start: string;
  length: string;
  prefix: string;
  suffix: string;
  transaction_journal_entries: {
    enabled: boolean;
    transaction_separator: string;
    log_detail_request_types: {
      transaction_authcapture: { prefix: string };
      transaction_capture: { prefix: string };
      transaction_refund: { prefix: string };
      transaction_void: { prefix: string };
    };
  };
};
