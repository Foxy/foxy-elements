import { ComputedElementProperties, HALJSONResource, NucleonMachine, NucleonV8N } from './types';
import { html, LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Nucleon, Rumour } from '@foxy.io/sdk/core';
import { assign, interpret } from 'xstate';

import { API } from './API';
import { FetchEvent } from './FetchEvent';
import { UpdateEvent, UpdateResult } from './UpdateEvent';
import memoize from 'lodash-es/memoize';
import { serveFromCache } from './serveFromCache';
import { InferrableMixin } from '../../../mixins/inferrable';
import { internalServer } from './internalServer';
import { uniqueId } from 'lodash-es';

/**
 * Base class for custom elements working with remote HAL+JSON resources.
 *
 * @fires NucleonElement#update - Instance of `NucleonElement.UpdateEvent`. Dispatched on an element whenever it changes its state.
 * @fires NucleonElement#fetch - Instance of `NucleonElement.API.FetchEvent`. Emitted before each API request.
 *
 * @element foxy-nucleon
 * @since 1.1.0
 */
export class NucleonElement<TData extends HALJSONResource> extends InferrableMixin(LitElement) {
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

  static get inferredProperties(): string[] {
    return [...super.inferredProperties, 'group', 'lang'];
  }

  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      __state: { type: String, reflect: true, attribute: 'state' },
      virtualHost: { attribute: 'virtual-host' },
      related: { type: Array },
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
  static get v8n(): NucleonV8N<any, any> {
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

  /**
   * Optional URI list of the related resources. If Rumour encounters a related
   * resource on creation or deletion, it will be reloaded from source.
   */
  related: string[] = [];

  /**
   * Unique identifier for the virtual host used by the element to serve internal requests.
   *
   * Currently only one endpoint is supported: `foxy://<virtualHost>/form/<path>`.
   * This endpoint supports POST, GET, PATCH and DELETE methods and functions like a hAPI server.
   *
   * For example, `GET foxy://nucleon-123/form/subscriptions/allowNextDateModification/0` on a NucleonElement
   * with `fx:customer_portal_settings` will return the first item of the `subscriptions.allowNextDateModification` array.
   */
  virtualHost: string | null = uniqueId('nucleon-');

  private __hrefToLoad: string | null = null;

  private __group = '';

  private __unsubscribeFromRumour: (() => void) | null = null;

  private __fetchEventHandler!: (evt: Event) => void;

  private __fetchEventQueue: FetchEvent[] = [];

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
              .map(validate => validate(form, this))
              .filter(v8nResult => typeof v8nResult === 'string')
              .filter((err, errIndex, errs) => errs.indexOf(err) === errIndex) as string[];
          },
        }),
      },
    })
  );

  constructor() {
    super();
    this.__createService();
  }

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
    return this.__service.state?.context.failure ?? null;
  }

  /**
   * Array of validation errors returned from `NucleonElement.v8n` checks.
   *
   * This property is readonly. Adding or removing error codes via this property is
   * not guaranteed to work. NucleonElement does not provide a way to override validity status.
   */
  get errors(): string[] {
    return this.__service.state?.context.errors ?? [];
  }

  /**
   * Resource snapshot with edits applied. Empty object if unavailable.
   *
   * This property and its value are readonly. Assignments like `element.data.foo = 'bar'`
   * are not guaranteed to work. Please use `element.edit({ foo: 'bar' })` instead.
   * If you need to replace the entire data object, consider using `element.data`.
   */
  get form(): Partial<TData> {
    const { data, edits } = this.__service.state?.context ?? {};
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
    return this.__service.state?.context.data ?? null;
  }

  set data(data: TData | null) {
    this.__destroyRumour();
    this.__hrefToLoad = null;
    this.__service.send({ type: 'SET_DATA', data });
    if (data) this.__createRumour();
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
    return this.form._links?.self.href ?? this.__hrefToLoad ?? '';
  }

  set href(value: string) {
    this.__hrefToLoad = value;

    if (value) {
      this.__service.send({ type: 'FETCH' });
    } else {
      this.data = null;
    }
  }

  /**
   * Checks if this element is in the given state.
   * @example element.in({ idle: 'snapshot' })
   */
  in<TStateValue extends Nucleon.State<TData, string>['value']>(
    stateValue: TStateValue
  ): this is this & ComputedElementProperties<TData, TStateValue> {
    return !!this.__service.state?.matches(stateValue);
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
    if (typeof data._links?.self.href === 'string') this.__hrefToLoad = null;
    this.__service.send({ type: 'EDIT', data });
  }

  /**
   * Submits the form, updating the resource if href isn't empty or creating it otherwise.
   * Emits multiple `update` events as element state changes. Has no effect on invalid forms.
   * @example element.submit()
   */
  submit(): void {
    this.reportValidity();
    this.__service.send({ type: 'SUBMIT' });
  }

  checkValidity(): boolean {
    const isTemplateDirtyValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotDirtyValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isTemplateCleanValid = this.in({ idle: { template: { clean: 'valid' } } });
    const isSnapshotCleanValid = this.in({ idle: { snapshot: { clean: 'valid' } } });
    const isTemplateValid = isTemplateCleanValid || isTemplateDirtyValid;
    const isSnapshotValid = isSnapshotCleanValid || isSnapshotDirtyValid;
    const isValid = isTemplateValid || isSnapshotValid;

    return isValid;
  }

  reportValidity(): boolean {
    const walker = this.ownerDocument.createTreeWalker(this.renderRoot, NodeFilter.SHOW_ELEMENT);

    do {
      type Input = Node & Record<string, () => unknown>;

      const node = walker.currentNode as Input;
      const methods = ['reportValidity', 'validate'];

      for (const method of methods) {
        if (method in node) {
          try {
            node[method]();
            break;
          } catch {
            continue;
          }
        }
      }
    } while (walker.nextNode());

    return this.checkValidity();
  }

  /**
   * Sends a DELETE request to `element.href` and clears local data on success.
   * Emits multiple update events as element state changes.
   * @example element.delete()
   */
  delete(): void {
    this.__service.send({ type: 'DELETE' });
  }

  /**
   * Fetches data from `element.href` in background, keeping the edits and v8n errors.
   * @example element.refresh()
   */
  refresh(): void {
    this.__service.send({ type: 'REFRESH' });
  }

  render(): TemplateResult {
    return html`<slot></slot>`;
  }

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    if (this.href && !this.data) this.__service.send({ type: 'FETCH' });

    this.__createRumour();
    this.__createServer();
    this.__processFetchEventQueue();

    this.dispatchEvent(new UpdateEvent());
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.__destroyRumour();
    this.__destroyServer();
    this.__flushFetchEventQueue('parent element was disconnected');

    this.dispatchEvent(new UpdateEvent());
  }

  applyInferredProperties(context: Map<string, unknown>): void {
    super.applyInferredProperties(context);

    if (this.infer === null) return;

    this.group = (context.get('group') as string | undefined) ?? '';
    this.lang = (context.get('lang') as string | undefined) ?? '';
  }

  /** Sends API request. Throws an error on non-2XX response. */
  protected async _fetch<TResult = TData>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    const response = await new API(this).fetch(...args);
    if (!response.ok) throw response;
    return response.json();
  }

  /** POSTs to `element.parent`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendPost(edits: Partial<TData>): Promise<TData> {
    this.__destroyRumour();
    let data: TData;

    try {
      const body = JSON.stringify(edits);
      const postData = await this._fetch(this.parent, { body, method: 'POST' });
      data = await this._fetch(postData._links.self.href);

      const rumour = NucleonElement.Rumour(this.group);
      const related = [...this.related, this.parent];
      rumour.share({ data, related, source: data._links.self.href });
    } finally {
      this.__createRumour();
    }

    return data;
  }

  /** GETs `element.href`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendGet(): Promise<TData> {
    this.__destroyRumour();
    let data: TData;

    try {
      data = await this._fetch(this.href);
      NucleonElement.Rumour(this.group).share({ data, source: this.href });
    } finally {
      this.__createRumour();
    }

    return data;
  }

  /** PATCHes `element.href`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendPatch(edits: Partial<TData>): Promise<TData> {
    this.__destroyRumour();
    let data: TData;

    try {
      const body = JSON.stringify(edits);
      data = await this._fetch(this.href, { body, method: 'PATCH' });

      const rumour = NucleonElement.Rumour(this.group);
      rumour.share({ data, source: this.href, related: this.related });
    } finally {
      this.__createRumour();
    }

    return data;
  }

  /** DELETEs `element.href`, shares response with the Rumour group and returns parsed JSON. */
  protected async _sendDelete(): Promise<null> {
    this.__destroyRumour();

    try {
      await this._fetch(this.href, { method: 'DELETE' });

      const rumour = NucleonElement.Rumour(this.group);
      const related = [...this.related, this.parent];
      rumour.share({ data: null, source: this.href, related });
    } finally {
      this.__createRumour();
    }

    return null;
  }

  // this getter is used by LitElement to set the "state" attribute
  private get __state(): string {
    const state = this.__service.state;
    const flags = state?.toStrings().reduce((p, c) => [...p, ...c.split('.')], [] as string[]);
    return [...new Set(flags ?? [])].join(' ');
  }

  private __createService() {
    this.__service.onTransition(state => {
      if (!state.changed) return;

      let result: UpdateResult | undefined = undefined;

      if (state.matches('idle') && state.context.errors.length === 0) {
        if (state.history?.matches({ busy: 'deleting' })) {
          result = UpdateResult.ResourceDeleted;
        } else if (state.history?.matches({ busy: 'creating' })) {
          result = UpdateResult.ResourceCreated;
        } else if (state.history?.matches({ busy: 'updating' })) {
          result = UpdateResult.ResourceUpdated;
        } else if (state.history?.matches({ busy: 'fetching' })) {
          result = UpdateResult.ResourceFetched;
        }
      }

      this.requestUpdate();
      this.dispatchEvent(new UpdateEvent('update', { detail: { result } }));

      if (!state.matches('busy')) this.__processFetchEventQueue();
    });

    this.__service.onChange(() => {
      this.requestUpdate();
      this.dispatchEvent(new UpdateEvent());
    });

    this.__service.start();
  }

  private __createRumour() {
    const rumour = NucleonElement.Rumour(this.group);
    this.__unsubscribeFromRumour = rumour.track(update => this.__handleRumourUpdate(update));
  }

  private __destroyRumour() {
    this.__unsubscribeFromRumour?.();
    this.__unsubscribeFromRumour = null;
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
      const oldData = this.__service.state?.context.data;
      const newData = oldData ? update(oldData) : oldData;

      if (newData !== oldData) {
        this.data = newData;

        if (!newData) {
          const result = UpdateResult.ResourceDeleted;
          const event = new UpdateEvent('update', { detail: { result } });
          this.dispatchEvent(event);
        }
      }
    } catch (err) {
      if (err instanceof Rumour.UpdateError) {
        setTimeout(() => this.refresh());
      } else {
        throw err;
      }
    }
  }

  private __processFetchEventQueue() {
    const api = new NucleonElement.API(this);

    this.__fetchEventQueue.forEach(event => {
      const request = event.request;

      if (this.virtualHost && request.url.startsWith(`foxy://${this.virtualHost}/form/`)) {
        return event.respondWith(internalServer(request, this));
      }

      const cacheResponse = serveFromCache(request.url, this.data);
      const whenResponseReady = cacheResponse.ok ? cacheResponse : api.fetch(request);

      event.respondWith(Promise.resolve(whenResponseReady));

      if (cacheResponse.ok) {
        console.debug(
          `%c@foxy.io/elements::${this.localName}\n%c200%c GET ${request.url}`,
          'color: gray',
          `background: gray; padding: 0 .2em; border-radius: .2em; color: white;`,
          ''
        );
      }
    });

    this.__fetchEventQueue = [];
  }

  private __flushFetchEventQueue(errorMessage: string) {
    this.__fetchEventQueue.forEach(event => {
      event.respondWith(Promise.reject(new Error(errorMessage)));
    });

    this.__fetchEventQueue = [];
  }

  private __handleFetchEvent(event: Event) {
    if (!(event instanceof FetchEvent)) return;
    if (event.defaultPrevented) return;
    if (event.composedPath()[0] === this) return;

    const { url, method } = event.request;

    if (url.startsWith('foxy://')) {
      if (this.virtualHost && url.startsWith(`foxy://${this.virtualHost}/form/`)) {
        if (method !== 'GET') return event.respondWith(internalServer(event.request, this));
      } else {
        return;
      }
    }

    if (method === 'GET') {
      event.preventDefault();
      this.__fetchEventQueue.push(event);
      if (!this.__service.state?.matches('busy')) this.__processFetchEventQueue();
    }
  }
}
