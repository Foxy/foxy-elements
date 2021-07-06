import * as FoxySDK from '@foxy.io/sdk';
import { Renderer } from '../../../mixins/configurable';
import { CustomerForm } from './CustomerForm';

export type Rel = FoxySDK.Customer.Graph;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;
export type TextFieldParams = { field: keyof Data };
export type Templates = {
  'first-name:before'?: Renderer<CustomerForm>;
  'first-name:after'?: Renderer<CustomerForm>;
  'last-name:before'?: Renderer<CustomerForm>;
  'last-name:after'?: Renderer<CustomerForm>;
  'email:before'?: Renderer<CustomerForm>;
  'email:after'?: Renderer<CustomerForm>;
  'tax-id:before'?: Renderer<CustomerForm>;
  'tax-id:after'?: Renderer<CustomerForm>;
  'timestamps:before'?: Renderer<CustomerForm>;
  'timestamps:after'?: Renderer<CustomerForm>;
  'delete:before'?: Renderer<CustomerForm>;
  'delete:after'?: Renderer<CustomerForm>;
  'create:before'?: Renderer<CustomerForm>;
  'create:after'?: Renderer<CustomerForm>;
};
