import i18next from 'i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { isEqual, isMatchWith } from 'lodash-es';
import { LitElement, property } from 'lit-element';

import {
  interpret,
  Interpreter,
  EventObject,
  StateValue,
  StateMachine,
} from 'xstate';

import { tailwind } from './common/tailwind.js';

const whenInitialized = i18next
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    partialBundledLanguages: true,
    fallbackLng: "en",
    defaultNS: "global",
    whitelist: ["en"],
    ns: ["global"],
    backend: { loadPath: 'translations/{{ns}}/{{lng}}.json' },
    load: "languageOnly",
  });

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

export abstract class StatefulElement<
  TContext,
  TStateSchema,
  TEvent extends EventObject
> extends LitElement {
  static styles = tailwind;

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

  @property({ type: String })
  locale = "en";

  constructor(
    protected _machine: StateMachine<TContext, TStateSchema, TEvent>
  ) {
    super();
    this._service = this.__initService();
    
    whenInitialized
      .then(() => i18next.loadNamespaces(this.__namespace))
      .then(() => this.requestUpdate());
  }

  private get __namespace() {
    return this.tagName.toLowerCase().substr(5);
  }

  protected get _t() {
    return i18next.getFixedT(this.locale, this.__namespace);
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
