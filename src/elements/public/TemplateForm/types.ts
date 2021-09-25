import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';

export type AdminEmailTemplateItem = Resource<Rels.AdminEmailTemplate>;
export type CartIncludeTemplateItem = Resource<Rels.CartIncludeTemplate>;
export type CartTemplateItem = Resource<Rels.CartTemplate>;
export type CheckoutTemplateItem = Resource<Rels.CheckoutTemplate>;
export type CustomerEmailTemplateItem = Resource<Rels.CustomerEmailTemplate>;
export type EmailTemplateItem = Resource<Rels.EmailTemplate & { props: { subject: string } }>;
