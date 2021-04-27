import { State, Context } from './machine';
import { AnyEventObject, EventObject, Typestate, State as MachineState } from 'xstate';

type ComputedState<
  TContext,
  TTypestate extends Typestate<TContext>,
  TSV extends TTypestate['value'],
  TEvent extends EventObject,
  TStateSchema
> = MachineState<
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

export type ComputedElementProperties<
  TSV extends State['value'],
  TContext extends Context = ComputedState<Context, State, TSV, AnyEventObject, any>['context']
> = { settings: TContext['settings'] };
