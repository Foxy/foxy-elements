import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { HALJSONResource } from '../NucleonElement/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { SpinnerState } from '../Spinner/Spinner';

export type SpinnerRendererContext = {
  state: SpinnerState;
  html: typeof html;
  lang: string;
};

export type SpinnerRenderer = (ctx: SpinnerRendererContext) => TemplateResult;

export type ItemRendererContext = {
  parent: string;
  html: typeof html;
  lang: string;
  data: any;
};

export type ItemRenderer = (ctx: ItemRendererContext) => TemplateResult;

type HALJSONCollection = HALJSONResource & { _embedded: Record<string, unknown[]> };

export class CollectionPage<TData extends HALJSONCollection> extends NucleonElement<TData> {
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

  createRenderRoot(): HTMLElement {
    return this;
  }

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
