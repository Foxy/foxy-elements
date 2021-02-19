import {
  ComputedElementProperties,
  HALJSONResource,
  NucleonMachine,
  NucleonState,
  NucleonV8N,
} from './types';
import { LitElement, PropertyDeclarations } from 'lit-element';
import { Nucleon, Rumour } from '@foxy.io/sdk/core';
import { assign, interpret } from 'xstate';

import { API } from './API';
import { FetchEvent } from './FetchEvent';
import { UpdateEvent } from './UpdateEvent';
import { memoize } from 'lodash-es';
import traverse from 'traverse';

export class NucleonElement<TData extends HALJSONResource> extends LitElement {
  static readonly UpdateEvent = UpdateEvent;

  static readonly FetchEvent = FetchEvent;

  static readonly Rumour = memoize<(group: string) => Rumour>(() => new Rumour());

  static readonly API = API;

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      parent: { type: String },
      group: { type: String, noAccessor: true },
      href: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  static get v8n(): NucleonV8N<any> {
    return [];
  }

  lang = '';

  parent = '';

  private __href = '';

  private __group = '';

  private __unsubscribeFromRumour!: () => void;

  private __fetchEventHandler!: (evt: Event) => void;

  private readonly __service = interpret(
    (Nucleon.machine as NucleonMachine<TData>).withConfig({
      services: {
        sendDelete: () => this._sendDelete(),
        sendPatch: ({ edits }) => this._sendPatch(edits!),
        sendPost: ({ edits }) => this._sendPost(edits!),
        sendGet: () => this._sendGet(),
      },

      actions: {
        validate: assign<Nucleon.Context<TData, string>, Nucleon.Event<TData>>({
          errors: context => {
            const rules = (this.constructor as typeof NucleonElement).v8n;
            const form = { ...context.data, ...context.edits };

            return rules
              .map(validate => validate(form))
              .filter(v8nResult => typeof v8nResult === 'string')
              .filter((err, errIndex, errs) => errs.indexOf(err) === errIndex) as string[];
          },
        }),
      },
    })
  );

  /** @deprecated */
  get state(): NucleonState<TData> {
    const { context, matches } = this.__service.state;
    return { context, matches };
  }

  /** Validation errors returned from `NucleonElement.v8n` checks. */
  get errors(): string[] {
    return this.__service.state.context.errors;
  }

  /** Resource snapshot with edits applied. */
  get form(): Partial<TData> {
    const { data, edits } = this.__service.state.context;
    return { ...data, ...edits } as Partial<TData>;
  }

  /** Resource snapshot as-is, no edits applied. */
  get data(): TData | null {
    return this.__service.state.context.data;
  }

  set data(data: TData | null) {
    this.__service.send({ type: 'SET_DATA', data });
    this.__href = data?._links.self.href ?? '';
  }

  get group(): string {
    return this.__group;
  }

  set group(value: string) {
    this.__group = value;
    this.__destroyRumour();
    this.__createRumour();
  }

  get href(): string {
    return this.__href;
  }

  set href(value: string) {
    this.__href = value;

    if (value) {
      this.__service.send({ type: 'FETCH' });
    } else {
      this.__service.send({ type: 'SET_DATA', data: null });
    }
  }

  /** Checks if this element is currently in the given state. */
  in<TStateValue extends Nucleon.State<TData, string>['value']>(
    stateValue: TStateValue
  ): this is this & ComputedElementProperties<TData, TStateValue> {
    return this.__service.state.matches(stateValue);
  }

  /** @deprecated */
  send(event: Nucleon.Event<TData>): void {
    this.__service.send(event);
  }

  /** Clears all edits. */
  undo(): void {
    this.__service.send({ type: 'UNDO' });
  }

  /** Applies an edit to the local resource snapshot or its template. */
  edit(data: Partial<TData>): void {
    this.__service.send({ type: 'EDIT', data });
  }

  /** Submits the form, updating the resource if href isn't empty or creating it otherwise. */
  submit(): void {
    this.__service.send({ type: 'SUBMIT' });
  }

  /** Sends a DELETE request to href and clears local data on success. */
  delete(): void {
    this.__service.send({ type: 'DELETE' });
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.__createService();
    this.__createRumour();
    this.__createServer();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.__destroyService();
    this.__destroyRumour();
    this.__destroyServer();
  }

  protected async _fetch(...args: Parameters<Window['fetch']>): Promise<TData> {
    const response = await new API(this).fetch(...args);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  }

  protected async _sendPost(edits: Partial<TData>): Promise<TData> {
    const body = JSON.stringify(edits);
    const data = await this._fetch(this.parent, { body, method: 'POST' });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data, related: [this.parent], source: data._links.self.href });
    return data;
  }

  protected async _sendGet(): Promise<TData> {
    const data = await this._fetch(this.href);
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data, source: this.href });
    return data;
  }

  protected async _sendPatch(edits: Partial<TData>): Promise<TData> {
    const body = JSON.stringify(edits);
    const data = await this._fetch(this.href, { body, method: 'PATCH' });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data, source: this.href });
    return data;
  }

  protected async _sendDelete(): Promise<TData> {
    const data = await this._fetch(this.href, { method: 'DELETE' });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data: null, source: this.href, related: [this.parent] });
    return data;
  }

  private __createService() {
    this.__service.onTransition(state => {
      if (!state.changed) return;

      const flags = state.toStrings().reduce((p, c) => [...p, ...c.split('.')], [] as string[]);
      this.setAttribute('state', [...new Set(flags)].join(' '));

      this.requestUpdate();
      this.dispatchEvent(
        new UpdateEvent<TData>('update', { detail: state })
      );
    });

    this.__service.onChange(() => {
      this.requestUpdate();
      this.dispatchEvent(
        new UpdateEvent<TData>('update', { detail: this.__service.state })
      );
    });

    this.__service.start();
    if (this.href) this.__service.send({ type: 'FETCH' });
  }

  private __destroyService() {
    this.__service.stop();
  }

  private __createRumour() {
    const rumour = NucleonElement.Rumour(this.group);
    this.__unsubscribeFromRumour = rumour.track(update => this.__handleRumourUpdate(update));
  }

  private __destroyRumour() {
    this.__unsubscribeFromRumour();
  }

  private __createServer() {
    this.__fetchEventHandler = this.__handleFetchEvent.bind(this);
    this.addEventListener('fetch', this.__fetchEventHandler);
  }

  private __destroyServer() {
    this.removeEventListener('fetch', this.__fetchEventHandler);
  }

  private __handleRumourUpdate(update: (oldData: TData) => TData | null) {
    try {
      const oldData = this.__service.state.context.data;
      if (!oldData) return;

      const newData = update(oldData);
      if (newData !== oldData) this.__service.send({ data: newData, type: 'SET_DATA' });
    } catch (err) {
      if (err instanceof Rumour.UpdateError) {
        this.__service.send({ type: 'FETCH' });
      } else {
        throw err;
      }
    }
  }

  private __handleFetchEvent(event: Event) {
    if (!(event instanceof FetchEvent)) return;
    if (event.request.method !== 'GET') return;

    traverse(this.__service.state.context.data).forEach(function () {
      if (this.node?._links?.self?.href === event.request.url) {
        const body = JSON.stringify(this.node);
        event.respondWith(Promise.resolve(new Response(body)));
        this.stop();
      }
    });
  }
}
