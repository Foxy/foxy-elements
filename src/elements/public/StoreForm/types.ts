import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type {
  StoreCustomDisplayIdConfigJson,
  StoreSmtpConfigJson,
  StoreWebhookKeyJson,
} from '@foxy.io/sdk/dist/types/backend/Rels';

export type Data = Omit<Resource<Rels.Store>, 'custom_display_id_config'> & {
  custom_display_id_config: StoreCustomDisplayIdConfigJson;
};

export type ParsedWebhookKey = StoreWebhookKeyJson;
export type ParsedSmtpConfig = StoreSmtpConfigJson;
export type ParsedCustomDisplayIdConfig = StoreCustomDisplayIdConfigJson;
