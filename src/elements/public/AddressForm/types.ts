import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';

export type Data = Resource<Rels.CustomerAddress>;

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
