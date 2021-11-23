import { Rels } from '@foxy.io/sdk/backend';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';
import { TaxForm } from './TaxForm';

export type Data = Resource<Rels.Tax>;

export type Templates = {
  'name:before'?: Renderer<TaxForm>;
  'name:after'?: Renderer<TaxForm>;
  'type:before'?: Renderer<TaxForm>;
  'type:after'?: Renderer<TaxForm>;
  'country:before'?: Renderer<TaxForm>;
  'country:after'?: Renderer<TaxForm>;
  'region:before'?: Renderer<TaxForm>;
  'region:after'?: Renderer<TaxForm>;
  'city:before'?: Renderer<TaxForm>;
  'city:after'?: Renderer<TaxForm>;
  'provider:before'?: Renderer<TaxForm>;
  'provider:after'?: Renderer<TaxForm>;
  'rate:before'?: Renderer<TaxForm>;
  'rate:after'?: Renderer<TaxForm>;
  'apply-to-shipping:before'?: Renderer<TaxForm>;
  'apply-to-shipping:after'?: Renderer<TaxForm>;
  'use-origin-rates:before'?: Renderer<TaxForm>;
  'use-origin-rates:after'?: Renderer<TaxForm>;
  'exempt-all-customer-tax-ids:before'?: Renderer<TaxForm>;
  'exempt-all-customer-tax-ids:after'?: Renderer<TaxForm>;
  'timestamps:before'?: Renderer<TaxForm>;
  'timestamps:after'?: Renderer<TaxForm>;
  'delete:before'?: Renderer<TaxForm>;
  'delete:after'?: Renderer<TaxForm>;
  'create:before'?: Renderer<TaxForm>;
  'create:after'?: Renderer<TaxForm>;
};
