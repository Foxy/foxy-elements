import type { PasskeyForm } from './PasskeyForm';
import type { Renderer } from '../../../mixins/configurable';

export type { Data } from '../PasskeyCard/types';

export type Templates = {
  'credential-id:before'?: Renderer<PasskeyForm>;
  'credential-id:after'?: Renderer<PasskeyForm>;
  'last-login-date:before'?: Renderer<PasskeyForm>;
  'last-login-date:after'?: Renderer<PasskeyForm>;
  'last-login-ua:before'?: Renderer<PasskeyForm>;
  'last-login-ua:after'?: Renderer<PasskeyForm>;
  'timestamps:before'?: Renderer<PasskeyForm>;
  'timestamps:after'?: Renderer<PasskeyForm>;
  'create:before'?: Renderer<PasskeyForm>;
  'create:after'?: Renderer<PasskeyForm>;
  'delete:before'?: Renderer<PasskeyForm>;
  'delete:after'?: Renderer<PasskeyForm>;
};
