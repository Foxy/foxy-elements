import { isEqual, isMatchWith } from 'lodash-es';
import { property } from 'lit-element';

import {
  interpret,
  Interpreter,
  EventObject,
  StateValue,
  StateMachine,
} from 'xstate';

import { Translatable } from './translatable.js';

const dontMatchEmpty = (a: object, b: object) => {
  if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
    return false;
  }
};

interface NotifyStateEventDetail {
  property: 'state';
  value: StateValue;
}

interface NotifyContextEventDetail<TContext> {
  property: 'context';
  value: TContext;
}

type NotifyEventDetail<TContext> =
  | NotifyStateEventDetail
  | NotifyContextEventDetail<TContext>;

export class NotifyEvent<TContext> extends CustomEvent<
  NotifyEventDetail<TContext>
> {
  constructor(detail: NotifyEventDetail<TContext>) {
    super('notify', { detail });
  }
}

interface RequestEventDetail {
  resolve: (response: ResponseInit) => void;
  reject: (error: Error) => void;
  input: RequestInfo;
  init?: RequestInit;
}

export class RequestEvent extends CustomEvent<RequestEventDetail> {
  constructor(detail: RequestEventDetail) {
    super('request', {
      composed: true,
      bubbles: true,
      detail,
    });
  }
}

export abstract class Stateful<
  TContext,
  TStateSchema,
  TEvent extends EventObject
> extends Translatable {
  protected _service: Interpreter<TContext, TStateSchema, TEvent>;

  @property({ type: String, noAccessor: true })
  get state() {
    return this._service.state.value;
  }
  set state(value: StateValue) {
    if (!isEqual(this.state, value)) {
      this._service.stop();
      this._service = this.__initService(this.context, value);
      this.requestUpdate();
    }
  }

  @property({ type: Object, noAccessor: true })
  get context() {
    return this._service.state.context;
  }
  set context(value) {
    if (!isMatchWith(this.context as any, value as any, dontMatchEmpty)) {
      this._service.stop();
      this._service = this.__initService(value, this.state);
      this.requestUpdate();
    }
  }

  constructor(
    protected _machine: StateMachine<TContext, TStateSchema, TEvent>,
    namespace: string
  ) {
    super(namespace);
    this._service = this.__initService();
  }

  private __initService(
    context = this._machine.initialState.context,
    state = this._machine.initialState.value
  ) {
    const machine = this._machine.withContext({
      ...context,
      fetch: (input: RequestInfo, init?: RequestInit) =>
        new Promise((resolve, reject) =>
          this.dispatchEvent(new RequestEvent({ resolve, reject, input, init }))
        ),
    });

    return interpret(machine, { devTools: true })
      .onChange(value => {
        this.requestUpdate();
        this.dispatchEvent(
          new NotifyEvent<TContext>({ property: 'context', value })
        );
      })
      .onTransition(({ value }) => {
        this.requestUpdate();
        this.dispatchEvent(
          new NotifyEvent<TContext>({ property: 'state', value })
        );
      })
      .start(state);
  }

  send(event: TEvent) {
    this._service.send(event);
  }
}
