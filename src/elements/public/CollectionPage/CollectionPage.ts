import { ExtractItem, ItemRenderer, Page } from './types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { repeat } from 'lit-html/directives/repeat';
import { spread } from '@open-wc/lit-helpers';

const Base = ConfigurableMixin(TranslatableMixin(NucleonElement));

/**
 * Renders an element for each resource in a collection page.
 *
 * @element foxy-collection-page
 * @since 1.1.0
 */
export class CollectionPage<TPage extends Page> extends Base<TPage> {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      props: { type: Object },
      item: { type: String },
    };
  }

  /** Spread directive argument from `@open-wc/lit-helpers` (properties, event listeners and attributes you'd like to pass to the item element). */
  props: Record<string, unknown> = {};

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
            related=\${JSON.stringify(ctx.related)}
            parent=\${ctx.parent}
            group=\${ctx.group}
            href=\${ctx.href}
            lang=\${ctx.lang}
            ns="\${ctx.ns} $\{customElements.get('${value}')?.defaultNS ?? ''}"
            ?disabled=\${ctx.disabled}
            ?readonly=\${ctx.readonly}
            ?hidden=\${ctx.hidden}
            .templates=\${ctx.templates}
            ...=\${ctx.spread(ctx.props)}
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
      (item, index) =>
        this.__renderItem?.({
          disabledControls: this.disabledControls,
          readonlyControls: this.readonlyControls,
          hiddenControls: this.hiddenControls,
          templates: this.templates,
          disabled: this.disabled,
          readonly: this.readonly,
          previous: items[index - 1]?.data ?? null,
          related: this.related,
          hidden: this.hidden,
          parent: this.href,
          spread: spread,
          props: this.props,
          group: this.group,
          lang: this.lang,
          data: item.data,
          href: item.href,
          next: items[index + 1]?.data ?? null,
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
