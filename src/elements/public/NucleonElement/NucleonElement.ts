import { HALJSONResource, NucleonMachine, NucleonState, NucleonV8N } from './types';
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
      group: { type: String },
      href: { type: String },
      lang: { type: String },
    };
  }

  static get v8n(): NucleonV8N<any> {
    return [];
  }

  lang = '';

  href = '';

  group = '';

  parent = '';

  private __unsubscribeFromRumour!: () => void;

  private __fetchEventHandler!: (evt: Event) => void;

  private readonly __service = interpret(
    (Nucleon.machine as NucleonMachine<TData>).withConfig({
      services: {
        sendDelete: () => this.__delete(),
        sendPatch: ({ edits }) => this.__patch(edits!),
        sendPost: ({ edits }) => this.__post(edits!),
        sendGet: () => this.__get(),
      },

      actions: {
        validate: assign<Nucleon.Context>({
          errors: context => {
            const rules = (this.constructor as typeof NucleonElement).v8n;
            const form = { ...context.data, ...context.edits };

            return rules
              .map(validate => validate(form))
              .filter(validationResult => typeof validationResult === 'string')
              .filter((error, errorIndex, errors) => errors.indexOf(error) === errorIndex);
          },
        }),
      },
    })
  );

  get state(): NucleonState<TData> {
    const { context, matches } = this.__service.state;
    return { context, matches };
  }

  get data(): TData | null {
    return this.state.context.data;
  }

  set data(data: TData | null) {
    this.href = data?._links.self.href ?? '';
    this.send({ type: 'SET_DATA', data });
  }

  send(event: Nucleon.Event<TData>): void {
    this.__service.send(event);
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.__createService();
    this.__createRumour();
    this.__createServer();
  }

  updated(updates: Map<keyof this, unknown>): void {
    super.updated(updates);

    if (updates.has('group')) {
      this.__destroyRumour();
      this.__createRumour();
    }

    if (updates.has('href')) {
      if (this.href) {
        this.send({ type: 'FETCH' });
      } else {
        this.send({ type: 'SET_DATA', data: null });
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.__destroyService();
    this.__destroyRumour();
    this.__destroyServer();
  }

  private __createService() {
    this.__service.onTransition(state => {
      if (!state.changed) return;

      const flags = state.toStrings().reduce((p, c) => [...p, ...c.split('.')], [] as string[]);
      this.setAttribute('state', [...new Set(flags)].join(' '));

      this.dispatchEvent(new UpdateEvent('update', { detail: state }));
      this.requestUpdate();
    });

    this.__service.onChange(() => {
      this.dispatchEvent(new UpdateEvent('update', { detail: this.state }));
      this.requestUpdate();
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

    traverse(this.state.context.data).forEach(function () {
      if (this.node?._links?.self?.href === event.request.url) {
        const body = JSON.stringify(this.node);
        event.respondWith(Promise.resolve(new Response(body)));
        this.stop();
      }
    });
  }

  private async __fetch(...args: Parameters<Window['fetch']>) {
    const response = await new API(this).fetch(...args);
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  }

  private async __post(edits: Partial<TData>) {
    const body = JSON.stringify(edits);
    const data = await this.__fetch(this.parent, { body, method: 'POST' });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data, related: [this.parent], source: data._links.self.href });
    return data;
  }

  private async __get() {
    const data = await this.__fetch(this.href);
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data, source: this.href });
    return data;
  }

  private async __patch(edits: Partial<TData>) {
    const body = JSON.stringify(edits);
    const data = await this.__fetch(this.href, { body, method: 'PATCH' });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data, source: this.href });
    return data;
  }

  private async __delete() {
    const data = await this.__fetch(this.href, { method: 'DELETE' });
    const rumour = NucleonElement.Rumour(this.group);

    rumour.share({ data: null, source: this.href, related: [this.parent] });
    return data;
  }
}
