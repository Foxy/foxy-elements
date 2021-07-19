import { ComputedElementProperties, HALJSONResource, NucleonMachine, NucleonV8N } from './types';
import { LitElement, PropertyDeclarations } from 'lit-element';
import { Nucleon, Rumour } from '@foxy.io/sdk/core';
import { assign, interpret } from 'xstate';

import { API } from './API';
import { FetchEvent } from './FetchEvent';
import { UpdateEvent } from './UpdateEvent';
import memoize from 'lodash-es/memoize';
import traverse from 'traverse';

/**
 * Base class for custom elements working with remote HAL+JSON resources.
 *
 * @fires NucleonElement#update - Instance of `NucleonElement.UpdateEvent`. Dispatched on an element whenever it changes its state.
 * @fires NucleonElement#fetch - Instance of `NucleonElement.API.FetchEvent`. Emitted before each API request.
 *
 * @element foxy-nucleon
 * @since 1.1.0
 */
export class NucleonElement<TData extends HALJSONResource> extends LitElement {
  /**
   * Instances of this event are dispatched on an element whenever it changes its
   * state (e.g. when going from `busy` to `idle` or on `form` data change).
   * This event isn't cancelable, and it does not bubble.
   * @readonly
   */
  static readonly UpdateEvent = UpdateEvent;

  /**
   * Creates a tagged [Rumour](https://sdk.foxy.dev/classes/_core_index_.rumour.html)
   * instance if it doesn't exist or returns cached one otherwise. NucleonElements
   * use empty Rumour group by default.
   * @readonly
   */
  static readonly Rumour = memoize<(group: string) => Rumour>(() => new Rumour());

  /**
   * Universal [API](https://sdk.foxy.dev/classes/_core_index_.api.html) client
   * that dispatches cancellable `FetchEvent` on an element before each request.
   * @readonly
   */
  static readonly API = API;

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      parent: { type: String },
      group: { type: String, noAccessor: true },
      href: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  /**
   * Array of validation functions. Each function accepts `element.form` and must return
   * either an error code string if form data fails the check or `true` otherwise.
   * Error codes are collected in `element.errors`. Empty by default.
   */
  static get v8n(): NucleonV8N<any> {
    return [];
  }

  /**
   * Optional ISO 639-1 code describing the language element content is written in.
   * Changing the `lang` attribute will update the value of this property.
   */
  lang = '';

  /**
   * Optional URL of the collection this element's resource belongs to.
   * Changing the `parent` attribute will update the value of this property.
   */
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

  /**
   * If network request returns non-2XX code, the entire error response
   * will be available via this getter.
   *
   * This property is readonly. Changing failure records via this property is
   * not guaranteed to work. NucleonElement does not provide a way to override error status.
   *
   * @since 1.4.0
   */
  get failure(): Response | null {
    return this.__service.state.context.failure;
  }

  /**
   * Array of validation errors returned from `NucleonElement.v8n` checks.
   *
   * This property is readonly. Adding or removing error codes via this property is
   * not guaranteed to work. NucleonElement does not provide a way to override validity status.
   */
  get errors(): string[] {
    return this.__service.state.context.errors;
  }

  /**
   * Resource snapshot with edits applied. Empty object if unavailable.
   *
   * This property and its value are readonly. Assignments like `element.data.foo = 'bar'`
   * are not guaranteed to work. Please use `element.edit({ foo: 'bar' })` instead.
   * If you need to replace the entire data object, consider using `element.data`.
   */
  get form(): Partial<TData> {
    const { data, edits } = this.__service.state.context;
    return { ...data, ...edits } as Partial<TData>;
  }

  /**
   * Resource snapshot as-is, no edits applied. Null if unavailable.
   *
   * Returned value is not reactive. Assignments like `element.data.foo = 'bar'`
   * are not guaranteed to work. Please set the property instead: `element.data = { ...element.data, foo: 'bar' }`.
   * If you're processing user input, consider using `element.form` and `element.edit()` instead.
   */
  get data(): TData | null {
    return this.__service.state.context.data;
  }

  set data(data: TData | null) {
    this.__service.send({ type: 'SET_DATA', data });
    this.__href = data?._links.self.href ?? '';
  }

  /**
   * Rumour group. Elements in different groups will not share updates. Empty by default.
   * @example element.group = 'my-group'
   */
  get group(): string {
    return this.__group;
  }

  set group(value: string) {
    this.__group = value;
    this.__destroyRumour();
    this.__createRumour();
  }

  /**
   * Optional URL of the resource to load. Switches element to `idle.template` state if empty (default).
   * @example element.href = 'https://demo.foxycart.com/s/customer/attributes/0'
   */
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

  /**
   * Checks if this element is in the given state.
   * @example element.in({ idle: 'snapshot' })
   */
  in<TStateValue extends Nucleon.State<TData, string>['value']>(
    stateValue: TStateValue
  ): this is this & ComputedElementProperties<TData, TStateValue> {
    return this.__service.state.matches(stateValue);
  }

  /**
   * Clears all edits and emits the `update` event.
   * @example element.undo()
   */
  undo(): void {
    this.__service.send({ type: 'UNDO' });
  }

  /**
   * Applies an edit to the local resource snapshot or its template and emits the `update` event.
   * @example element.edit({ first_name: 'Alex' })
   */
  edit(data: Partial<TData>): void {
    this.__service.send({ type: 'EDIT', data });
  }

  /**
   * Submits the form, updating the resource if href isn't empty or creating it otherwise.
   * Emits multiple `update` events as element state changes. Has no effect on invalid forms.
   * @example element.submit()
   */
  submit(): void {
    this.__service.send({ type: 'SUBMIT' });
  }

  /**
   * Sends a DELETE request to `element.href` and clears local data on success.
   * Emits multiple update events as element state changes.
   * @example element.delete()
   */
  delete(): void {
    this.__service.send({ type: 'DELETE' });
  }

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();

    this.__createService();
    this.__createRumour();
    this.__createServer();
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.__destroyService();
    this.__destroyRumour();
    this.__destroyServer();
  }

  /** Sends API request. Throws an error on non-2XX response. */
  protected async _fetch(...args: Parameters<Window['fetch']>): Promise<TData> {
    const response = await new API(this).fetch(...args);
    if (!response.ok) throw response;
    return response.json();
  }

  /** POSTs to `element.parent`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendPost(edits: Partial<TData>): Promise<TData> {
    const body = JSON.stringify(edits);
    const data = await this._fetch(this.parent, { body, method: 'POST' });
    const rumour = NucleonElement.Rumour(this.group);

    this.__destroyRumour();
    rumour.share({ data, related: [this.parent], source: data._links.self.href });
    this.__createRumour();

    return data;
  }

  /** GETs `element.href`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendGet(): Promise<TData> {
    const data = await this._fetch(this.href);
    const rumour = NucleonElement.Rumour(this.group);

    this.__destroyRumour();
    rumour.share({ data, source: this.href });
    this.__createRumour();

    return data;
  }

  /** PATCHes `element.href`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendPatch(edits: Partial<TData>): Promise<TData> {
    const body = JSON.stringify(edits);
    const data = await this._fetch(this.href, { body, method: 'PATCH' });
    const rumour = NucleonElement.Rumour(this.group);

    this.__destroyRumour();
    rumour.share({ data, source: this.href });
    this.__createRumour();

    return data;
  }

  /** DELETEs `element.href`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendDelete(): Promise<TData> {
    const data = await this._fetch(this.href, { method: 'DELETE' });
    const rumour = NucleonElement.Rumour(this.group);

    this.__destroyRumour();
    rumour.share({ data: null, source: this.href, related: [this.parent] });
    this.__createRumour();

    return data;
  }

  private __createService() {
    this.__service.onTransition(state => {
      if (!state.changed) return;

      const flags = state.toStrings().reduce((p, c) => [...p, ...c.split('.')], [] as string[]);
      this.setAttribute('state', [...new Set(flags)].join(' '));

      this.requestUpdate();
      this.dispatchEvent(new UpdateEvent());
    });

    this.__service.onChange(() => {
      this.requestUpdate();
      this.dispatchEvent(new UpdateEvent());
    });

    this.__service.start();
  }

  private __destroyService() {
    this.__service.stop();
  }

  private __createRumour() {
    const rumour = NucleonElement.Rumour(this.group);
    this.__unsubscribeFromRumour = rumour.track(update => this.__handleRumourUpdate(update));
  }

  private __destroyRumour() {
    this.__unsubscribeFromRumour?.();
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

    const localName = this.localName;

    traverse(this.__service.state.context.data).forEach(function () {
      if (this.node?._links?.self?.href === event.request.url) {
        console.debug(
          `%c@foxy.io/elements::${localName}\n%c200%c GET ${event.request.url}`,
          'color: gray',
          `background: gray; padding: 0 .2em; border-radius: .2em; color: white;`,
          ''
        );

        const body = JSON.stringify(this.node);
        event.respondWith(Promise.resolve(new Response(body)));
        this.stop();
      }
    });
  }
}
