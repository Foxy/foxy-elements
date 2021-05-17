import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { Renderer } from '../../../mixins/configurable';
import { CancellationForm } from './CancellationForm';

export type Data = Resource<Rels.Subscription>;
export type Templates = {
  'warning:before'?: Renderer<CancellationForm>;
  'warning:after'?: Renderer<CancellationForm>;
  'end-date:before'?: Renderer<CancellationForm>;
  'end-date:after'?: Renderer<CancellationForm>;
  'submit:before'?: Renderer<CancellationForm>;
  'submit:after'?: Renderer<CancellationForm>;
};
