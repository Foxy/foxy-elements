import type { TemplateResult } from 'lit-html';
import type { Graph, Rels } from '@foxy.io/sdk/customer';
import type { Resource } from '@foxy.io/sdk/core';

export type CustomerAddresses = Resource<Rels.CustomerAddresses>;
export type Attributes = Resource<Rels.Attributes>;
export type Settings = Resource<Rels.CustomerPortalSettings>;
export type Data = Resource<Graph>;
export type Tab = { title: string; content: TemplateResult };
