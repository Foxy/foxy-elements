import { HALJSONCollection, ItemRenderer, SpinnerRenderer } from './types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { NucleonElement } from '../NucleonElement/NucleonElement';

/**
 * Renders an element for each resource in a collection page.
 *
 * @element foxy-collection-page
 * @since 1.1.0
 */
export class CollectionPage<TData extends HALJSONCollection> extends NucleonElement<TData> {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      item: { type: String, noAccessor: true },
    };
  }

  private __renderSpinner!: SpinnerRenderer;

  private __renderItem!: ItemRenderer;

  private __spinner!: string | SpinnerRenderer;

  private __item!: string | ItemRenderer;

  constructor() {
    super();
    this.item = 'foxy-null';
    this.spinner = 'foxy-spinner';
  }

  /**
   * Custom element tag or a render function to use for displaying collection items.
   * Generated custom elements will have the following attributes:
   *
   * - `parent` – same as `foxy-collection-page[href]`;
   * - `href` – collection page item's `_links.self.href` value;
   * - `lang` – same as `foxy-collection-page[lang]`;
   *
   * Render function will receive `ItemRendererContext` in the first argument.
   */
  get item(): string | ItemRenderer {
    return this.__item;
  }

  set item(value: string | ItemRenderer) {
    if (typeof value === 'string') {
      this.__renderItem = new Function(
        'ctx',
        `return ctx.html\`<${value} data-testclass="items" parent=\${ctx.parent} href=\${ctx.data._links.self.href} lang=\${ctx.lang}></${value}>\``
      ) as ItemRenderer;
    } else {
      this.__renderItem = value;
    }

    this.__item = value;
    this.requestUpdate();
  }

  /**
   * Custom element tag or a render function to use for displaying spinner.
   * Generated custom element will have the following attributes:
   *
   * - `state` - `error`, `busy` or `empty`;
   * - `lang` – same as `foxy-collection-page[lang]`;
   *
   * Render function will receive `SpinnerRendererContext` in the first argument.
   */
  get spinner(): string | SpinnerRenderer {
    return this.__spinner;
  }

  set spinner(value: string | SpinnerRenderer) {
    if (typeof value === 'string') {
      this.__renderSpinner = new Function(
        'ctx',
        `return ctx.html\`<${value} data-testid="spinner" state=\${ctx.state} lang=\${ctx.lang}></${value}>\``
      ) as SpinnerRenderer;
    } else {
      this.__renderSpinner = value;
    }

    this.__spinner = value;
    this.requestUpdate();
  }

  /** @readonly */
  createRenderRoot(): HTMLElement {
    return this;
  }

  /** @readonly */
  render(): TemplateResult {
    const items = this.__items;
    const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';

    return html`
      ${items.map((item: any) =>
        this.__renderItem?.({
          parent: this.href,
          lang: this.lang,
          data: item,
          html,
        })
      )}
      ${this.in('idle') && items.length > 0
        ? ''
        : this.__renderSpinner({ html, lang: this.lang, state: spinnerState })}
    `;
  }

  private get __items() {
    return Array.from(Object.values(this.form?._embedded ?? {}) as any[]).reduce(
      (p, c) => [...p, ...c],
      [] as any[]
    );
  }
}

export * from './types';
