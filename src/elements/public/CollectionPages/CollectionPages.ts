import { Context, Event, Page, PageRenderer } from './types';
import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { State, StateMachine, interpret } from 'xstate';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { Rumour } from '@foxy.io/sdk/core';
import { machine } from './machine';
import { repeat } from 'lit-html/directives/repeat';
import traverse from 'traverse';

/**
 * Renders an element for each page in a collection.
 *
 * @fires NucleonElement#update - Instance of `NucleonElement.UpdateEvent`. Dispatched on an element whenever it changes its state.
 * @fires NucleonElement#fetch - Instance of `NucleonElement.API.FetchEvent`. Emitted before each API request.
 *
 * @element foxy-collection-pages
 * @since 1.1.0
 */
export class CollectionPages<TPage extends Page> extends ConfigurableMixin(LitElement) {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      manual: { type: Boolean, reflect: true },
      first: { type: String, noAccessor: true },
      pages: { type: Array, noAccessor: true },
      group: { type: String },
      lang: { type: String },
      page: { type: String },
      ns: { type: String },
    };
  }

  /** Optional ISO 639-1 code describing the language element content is written in. */
  lang = '';

  ns = '';

  private __renderPage!: PageRenderer<TPage>;

  private __page!: string | PageRenderer<TPage>;

  private __group = '';

  private __stopTrackingRumour!: () => void;

  private __fetchEventHandler = (evt: unknown) => this.__handleFetchEvent(evt);

  private __service = interpret(
    (machine as unknown as StateMachine<Context<TPage>, any, Event<TPage>>).withConfig({
      services: {
        observeChildren: () => callback => {
          const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) callback('RESUME');
          });

          observer.observe(this.renderRoot.children[this.renderRoot.children.length - 1]);
          return () => observer.disconnect();
        },

        sendGet: async ctx => {
          const lastPage = ctx.pages[ctx.pages.length - 1];
          const lastPageHref = lastPage?._links.next.href ?? ctx.first;
          const response = await new NucleonElement.API(this).fetch(lastPageHref);

          if (!response.ok) throw response;
          const json = await response.json();

          this.__stopTrackingRumour();

          NucleonElement.Rumour(this.group).share({
            source: json._links.self.href,
            data: json,
          });

          this.__trackRumour();

          return json;
        },
      },
    })
  );

  constructor() {
    super();
    this.page = 'foxy-collection-page foxy-null';
  }

  /**
   * Custom element tag or a render function to use for displaying collection pages.
   * Generated custom elements will have the following attributes:
   *
   * - `group` – same as `foxy-collection-pages[group]`;
   * - `href` – collection page's `_links.self.href` value;
   * - `lang` – same as `foxy-collection-pages[lang]`;
   * - `item` – will contain `item-tag` when provided with a string value formatted as `page-tag item-tag`.
   *
   * Render function will receive `PageRenderer<TPage>` in the first argument.
   * Uses `foxy-collection-page` by default.
   */
  get page(): string | PageRenderer<TPage> {
    return this.__page;
  }

  set page(value: string | PageRenderer<TPage>) {
    if (typeof value === 'string') {
      const item = value.split(' ').pop();
      const itemAttribute = item ? `item="${item}"` : '';

      this.__renderPage = new Function(
        'ctx',
        `return ctx.html\`
          <${value}
            disabledcontrols=\${ctx.disabledControls.toString()}
            readonlycontrols=\${ctx.readonlyControls.toString()}
            hiddencontrols=\${ctx.hiddenControls.toString()}
            group=\${ctx.group}
            href=\${ctx.href}
            lang=\${ctx.lang}
            ns="$\{ctx.ns} $\{customElements.get('${value}')?.defaultNS ?? ''}"
            ${itemAttribute}
            ?disabled=\${ctx.disabled}
            ?readonly=\${ctx.readonly}
            ?hidden=\${ctx.hidden}
            .templates=\${ctx.templates}
          >
          </${value}>\``
      ) as PageRenderer<TPage>;
    } else {
      this.__renderPage = value;
    }

    this.__page = value;
    this.requestUpdate();
  }

  /** URL of the first page in a collection. */
  get first(): string {
    return this.__service.state.context.first;
  }

  set first(data: string) {
    this.__service.send({ type: 'SET_FIRST', data });
  }

  /** Array of all currently loaded pages in a collection. */
  get pages(): TPage[] {
    return this.__service.state.context.pages;
  }

  set pages(data: TPage[]) {
    this.__service.send({ type: 'SET_PAGES', data });
  }

  /** Rumour group. Elements in different groups will not share updates. Empty by default. */
  get group(): string {
    return this.__group;
  }

  set group(value: string) {
    this.__group = value;
    this.__stopTrackingRumour?.();
    this.__trackRumour();
  }

  /** If false, will load pages on scroll. If true, will display a button triggering the process. */
  get manual(): boolean {
    return this.__service.state.context.manual;
  }

  set manual(data: boolean) {
    this.__service.send({ type: 'SET_MANUAL', data });
  }

  /**
   * Checks if this element is in the given state. Available states:
   *
   * - `busy` when loading a page;
   * - `fail` when page load fails;
   * - `idle` when not loading anything for one of the reasons below:
   *   - `paused` if waiting for user to scroll further;
   *     - `manual` when next page load will be triggered by clicking a button;
   *     - `auto` when next page load will be triggered by scrolling to the observer target;
   *   - `empty` if collection is empty;
   *   - `end` if there are no more items in a collection.
   *
   * @example element.in({ idle: 'empty' })
   */
  in(stateValue: State<Context, Event>['value']): boolean {
    return this.__service.state.matches(stateValue);
  }

  /** @readonly */
  createRenderRoot(): CollectionPages<TPage> {
    return this;
  }

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('fetch', this.__fetchEventHandler);
    this.__createService();
    this.__trackRumour();
  }

  /** @readonly */
  render(): TemplateResult {
    const items = this.pages.map(page => ({
      key: page._links.self.href,
      href: page._links.self.href,
    }));

    if (this.__service.state.matches('busy')) {
      items.push({ key: 'stalled', href: 'foxy://collection-pages/stall' });
    } else if (this.__service.state.matches('fail')) {
      items.push({ key: 'failed', href: 'foxy://collection-pages/fail' });
    } else if (this.__service.state.matches({ idle: 'empty' })) {
      items.push({ key: 'empty', href: '' });
    }

    return html`
      <!-- collection items -->
      ${repeat(
        items,
        page => page.key,
        (page, pageIndex) => {
          return this.__renderPage({
            disabledControls: this.disabledControls,
            readonlyControls: this.readonlyControls,
            hiddenControls: this.hiddenControls,
            templates: this.templates,
            disabled: this.disabled,
            readonly: this.readonly,
            hidden: this.hidden,
            group: this.group,
            data: this.pages[pageIndex] ?? null,
            href: page.href,
            lang: this.lang,
            ns: this.ns,
            html,
          });
        }
      )}
      ${this.manual
        ? this.in({ idle: 'paused' })
          ? html`
              <!-- manual trigger -->
              <vaadin-button theme="small contrast" @click=${() => this.__service.send('RESUME')}>
                <foxy-i18n lang=${this.lang} key="load_more" ns=${this.ns}></foxy-i18n>
              </vaadin-button>
            `
          : ''
        : html`
            <!-- intersection observer target -->
            <span></span>
          `}
    `;
  }

  /** @readonly */
  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    this.dispatchEvent(new NucleonElement.UpdateEvent());
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('fetch', this.__fetchEventHandler);
    this.__service.stop();
    this.__stopTrackingRumour?.();
  }

  private __trackRumour() {
    this.__stopTrackingRumour = NucleonElement.Rumour(this.group).track(update => {
      try {
        this.pages.map(page => update(page));
      } catch (err) {
        if (err instanceof Rumour.UpdateError) {
          this.__service.send({ type: 'SET_FIRST', data: this.first });
        } else {
          throw err;
        }
      }
    });
  }

  private __createService() {
    this.__service
      .onTransition(({ changed }) => changed && this.requestUpdate())
      .onChange(() => this.requestUpdate())
      .start();
  }

  private __handleFetchEvent(event: unknown) {
    if (!(event instanceof FetchEvent) || event.target === this) return;
    const { method, url } = event.request;

    if (method !== 'GET') return;
    if (url === 'foxy://collection-pages/stall') return this.__stallRequest(event);
    if (url === 'foxy://collection-pages/fail') return this.__failRequest(event);

    this.__respondIfPossible(event);
  }

  private __respondIfPossible(event: FetchEvent) {
    const localName = this.localName;

    traverse(this.__service.state.context.pages).forEach(function () {
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

  private __stallRequest(event: FetchEvent) {
    event.stopImmediatePropagation();
    event.respondWith(new Promise(() => void 0));
  }

  private __failRequest(event: FetchEvent) {
    event.stopImmediatePropagation();
    event.respondWith(Promise.resolve(this.__service.state.context.error as Response));
  }
}
