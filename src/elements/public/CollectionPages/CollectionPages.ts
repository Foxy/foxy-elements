import { ItemRenderer, SpinnerRenderer } from '../CollectionPage/CollectionPage';
import { LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { NucleonElement } from '../NucleonElement/index';
import { get } from 'lodash-es';

export type PageRendererContext = {
  html: typeof html;
  href: string;
  lang: string;
  item: string | ItemRenderer;
  spinner: string | SpinnerRenderer;
};

export type SpinnerRendererContext = {
  html: typeof html;
  lang: string;
};

export type PageRenderer = (context: PageRendererContext) => TemplateResult;

export class CollectionPages extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      spinner: { type: String },
      first: { type: String, noAccessor: true },
      item: { type: String, noAccessor: true },
      page: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  lang = '';

  item: string | ItemRenderer = 'foxy-null';

  pages: string[] = [];

  spinner: string | SpinnerRenderer = 'foxy-spinner';

  private readonly __observer = new IntersectionObserver(
    es => es.some(s => s.isIntersecting) && this.__loadNext(),
    { rootMargin: '100%' }
  );

  private __page!: string | PageRenderer;

  private __renderPage!: PageRenderer;

  constructor() {
    super();
    this.page = 'foxy-collection-page';
  }

  get first(): string {
    return this.pages[0] ?? '';
  }

  set first(value: string) {
    this.pages.length = 0;
    if (value) this.pages[0] = value;
    this.requestUpdate();
  }

  get page(): string | PageRenderer {
    return this.__page;
  }

  set page(value: string | PageRenderer) {
    if (typeof value === 'string') {
      this.__renderPage = new Function(
        'ctx',
        `return ctx.html\`<${value} .item="\${ctx.item}" .spinner=\${ctx.spinner} href=\${ctx.href} lang=\${ctx.lang}></${value}>\``
      ) as PageRenderer;
    } else {
      this.__renderPage = value;
    }

    this.__page = value;
    this.requestUpdate();
  }

  createRenderRoot(): HTMLElement {
    return this;
  }

  updated(): void {
    this.__observer.disconnect();
    if (this.__lastPage) this.__observer.observe(this.__lastPage);
  }

  render(): TemplateResult {
    return html`${this.pages.map(page =>
      this.__renderPage?.({
        html,
        href: page,
        lang: this.lang,
        item: this.item,
        spinner: this.spinner,
      })
    )}`;
  }

  private get __lastPage() {
    type Child = NucleonElement<any> | null;
    return this.renderRoot.children[this.renderRoot.children.length - 1] as Child;
  }

  private __loadNext() {
    const next = get(this.__lastPage?.form, '_links.next.href') as string | undefined;
    if (!next) return;

    this.pages.push(next);
    this.requestUpdate();
  }
}
