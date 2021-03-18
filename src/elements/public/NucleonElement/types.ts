import { EventObject, State, StateMachine, Typestate } from 'xstate';

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

type ComputedNucleonState<
  TContext,
  TTypestate extends Typestate<TContext>,
  TSV extends TTypestate['value'],
  TEvent extends EventObject,
  TStateSchema
> = State<
  (TTypestate extends any
    ? {
        value: TSV;
        context: any;
      } extends TTypestate
      ? TTypestate
      : never
    : never)['context'],
  TEvent,
  TStateSchema,
  TTypestate
> & {
  value: TSV;
};

type ComputedContext<
  TData extends Record<string, unknown>,
  TSV extends Nucleon.State<TData, string>['value']
> = ComputedNucleonState<
  Nucleon.Context<TData, string>,
  Nucleon.State<TData, string>,
  TSV,
  Nucleon.Event<TData>,
  any
>['context'];

export type ComputedElementProperties<
  TData extends Record<string, unknown>,
  TSV extends Nucleon.State<TData, string>['value'],
  TContext extends Nucleon.Context<TData, string> = ComputedContext<TData, TSV>
> = TContext & { form: TContext['data'] & TContext['edits']; data: TContext['data'] };
