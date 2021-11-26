import { AddressForm } from './AddressForm';
import { Rels } from '@foxy.io/sdk/customer';
import { Renderer } from '../../../mixins/configurable';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.CustomerAddress>;
export type Templates = {
  'address-name:before'?: Renderer<AddressForm>;
  'address-name:after'?: Renderer<AddressForm>;
  'first-name:before'?: Renderer<AddressForm>;
  'first-name:after'?: Renderer<AddressForm>;
  'last-name:before'?: Renderer<AddressForm>;
  'last-name:after'?: Renderer<AddressForm>;
  'region:before'?: Renderer<AddressForm>;
  'region:after'?: Renderer<AddressForm>;
  'city:before'?: Renderer<AddressForm>;
  'city:after'?: Renderer<AddressForm>;
  'phone:before'?: Renderer<AddressForm>;
  'phone:after'?: Renderer<AddressForm>;
  'company:before'?: Renderer<AddressForm>;
  'company:after'?: Renderer<AddressForm>;
  'address-one:before'?: Renderer<AddressForm>;
  'address-one:after'?: Renderer<AddressForm>;
  'address-two:before'?: Renderer<AddressForm>;
  'address-two:after'?: Renderer<AddressForm>;
  'postal-code:before'?: Renderer<AddressForm>;
  'postal-code:after'?: Renderer<AddressForm>;
  'timestamps:before'?: Renderer<AddressForm>;
  'timestamps:after'?: Renderer<AddressForm>;
  'delete:before'?: Renderer<AddressForm>;
  'delete:after'?: Renderer<AddressForm>;
  'create:before'?: Renderer<AddressForm>;
  'create:after'?: Renderer<AddressForm>;
};

export type ComboBoxParams = {
  source: string[];
  field: keyof Data;
  custom?: boolean;
};

export type TextFieldParams = {
  field: keyof Data;
  wide?: boolean;
  required?: boolean;
  readonly?: boolean;
};
