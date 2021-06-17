import { ExtractItem, ItemRenderer, Page } from './types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement';
import { repeat } from 'lit-html/directives/repeat';

/**
 * Renders an element for each resource in a collection page.
 *
 * @element foxy-collection-page
 * @since 1.1.0
 */
export class CollectionPage<TPage extends Page> extends ConfigurableMixin(NucleonElement)<TPage> {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      item: { type: String },
      ns: { type: String },
    };
  }

  ns = '';

  private __pageFetchEventHandler = (evt: unknown) => this.__handlePageFetchEvent(evt);

  private __renderItem!: ItemRenderer<ExtractItem<TPage>>;

  private __item!: string | ItemRenderer<ExtractItem<TPage>>;

  constructor() {
    super();
    this.item = 'foxy-null';
  }

  /**
   * Custom element tag or a render function to use for displaying collection items.
   * Generated custom elements will have the following attributes:
   *
   * - `parent` – same as `foxy-collection-page[href]`;
   * - `group` - same as `foxy-collection-page[group]`;
   * - `href` – collection page item's `_links.self.href` value;
   * - `lang` – same as `foxy-collection-page[lang]`;
   *
   * Render function will receive `ItemRendererContext` in the first argument.
   */
  get item(): string | ItemRenderer<ExtractItem<TPage>> {
    return this.__item;
  }

  set item(value: string | ItemRenderer<ExtractItem<TPage>>) {
    if (typeof value === 'string') {
      this.__renderItem = new Function(
        'ctx',
        `return ctx.html\`
          <${value}
            disabledcontrols=\${ctx.disabledControls.toString()}
            readonlycontrols=\${ctx.readonlyControls.toString()}
            hiddencontrols=\${ctx.hiddenControls.toString()}
            data-testclass="items"
            parent=\${ctx.parent}
            group=\${ctx.group}
            href=\${ctx.href}
            lang=\${ctx.lang}
            ns="\${ctx.ns} $\{customElements.get('${value}')?.defaultNS ?? ''}"
            ?disabled=\${ctx.disabled}
            ?readonly=\${ctx.readonly}
            ?hidden=\${ctx.hidden}
            .templates=\${ctx.templates}
          >
          </${value}>\``
      ) as ItemRenderer;
    } else {
      this.__renderItem = value;
    }

    this.__item = value;
    this.requestUpdate();
  }

  /** @readonly */
  createRenderRoot(): HTMLElement {
    return this;
  }

  /** @readonly */
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('fetch', this.__pageFetchEventHandler);
  }

  /** @readonly */
  render(): TemplateResult {
    type RepeatItem = { key: string; href: string; data: ExtractItem<TPage> | null };
    const items: RepeatItem[] = this.__items.map(item => ({
      key: item._links.self.href,
      href: item._links.self.href,
      data: item,
    }));

    if (this.in('busy')) {
      items.push({ key: 'stalled', href: 'foxy://collection-page/stall', data: null });
    } else if (this.in('fail')) {
      items.push({ key: 'failed', href: 'foxy://collection-page/fail', data: null });
    } else if (this.in({ idle: 'template' }) || this.__items.length === 0) {
      items.push({ key: 'empty', href: '', data: null });
    }

    return html`${repeat(
      items,
      item => item.key,
      item =>
        this.__renderItem?.({
          disabledControls: this.disabledControls,
          readonlyControls: this.readonlyControls,
          hiddenControls: this.hiddenControls,
          templates: this.templates,
          disabled: this.disabled,
          readonly: this.readonly,
          hidden: this.hidden,
          parent: this.href,
          group: this.group,
          lang: this.lang,
          data: item.data,
          href: item.href,
          ns: this.ns,
          html,
        })
    )}`;
  }

  /** @readonly */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('fetch', this.__pageFetchEventHandler);
  }

  private get __items(): ExtractItem<TPage>[] {
    return Array.from(Object.values(this.form?._embedded ?? {}) as any[]).reduce(
      (p, c) => [...p, ...c],
      [] as ExtractItem<TPage>[]
    );
  }

  private __handlePageFetchEvent(event: unknown) {
    if (!(event instanceof FetchEvent) || event.target === this) return;
    const { method, url } = event.request;

    if (method !== 'GET') return;
    if (url === 'foxy://collection-page/stall') return this.__stallRequest(event);
    if (url === 'foxy://collection-page/fail') return this.__failRequest(event);
  }

  private __stallRequest(event: FetchEvent) {
    event.stopImmediatePropagation();
    event.respondWith(new Promise(() => void 0));
  }

  private __failRequest(event: FetchEvent) {
    event.stopImmediatePropagation();
    event.respondWith(Promise.resolve(new Response(null, { status: 500 })));
  }
}

export * from './types';
