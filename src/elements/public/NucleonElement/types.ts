import { State, StateMachine } from 'xstate';

import { Nucleon } from '@foxy.io/sdk/core';

export type NucleonMachine<TData extends HALJSONResource> = StateMachine<
  Nucleon.Context<TData, string>,
  any,
  Nucleon.Event<TData>,
  Nucleon.State<TData, string>
>;

export type NucleonState<TData extends HALJSONResource> = Pick<
  State<Nucleon.Context<TData, string>, Nucleon.Event<TData>, any, Nucleon.State<TData, string>>,
  'context' | 'matches'
>;

export type HALJSONResource = {
  readonly _links: {
    readonly self: {
      readonly href: string;
    };
  };
};

export type NucleonV8N<TData extends HALJSONResource> = ((r: Partial<TData>) => true | string)[];
