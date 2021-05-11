import { Graph, Rels } from '@foxy.io/sdk/customer';

import { Resource } from '@foxy.io/sdk/core';
import { TemplateResult } from 'lit-html';

export type CustomerAddresses = Resource<Rels.CustomerAddresses>;
export type Attributes = Resource<Rels.Attributes>;
export type Data = Resource<Graph>;
export type Tab = { title: string; content: TemplateResult };
