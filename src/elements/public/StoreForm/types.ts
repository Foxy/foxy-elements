import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type {
  StoreCustomDisplayIdConfigJson,
  StoreSmtpConfigJson,
  StoreWebhookKeyJson,
} from '@foxy.io/sdk/dist/types/backend/Rels';

export type Data = Resource<Rels.Store>;
export type ParsedWebhookKey = StoreWebhookKeyJson;
export type ParsedSmtpConfig = StoreSmtpConfigJson;
export type ParsedCustomDisplayIdConfig = StoreCustomDisplayIdConfigJson;
