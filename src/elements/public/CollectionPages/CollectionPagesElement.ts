import { LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { NucleonElement } from '../NucleonElement/index';

type HTMLFunction = typeof html;
type TemplateFunction = (
  html: HTMLFunction,
  href: string,
  item: string,
  lang: string
) => TemplateResult;

export class CollectionPagesElement extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      spinner: { type: String, noAccessor: true },
      state: { type: String },
      first: { type: String, noAccessor: true },
      item: { type: String, noAccessor: true },
      page: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  lang = '';

  item: string | null = null;

  pages: string[] = [];

  private readonly __observer = new IntersectionObserver(
    es => es.some(s => s.isIntersecting) && this.__loadNext(),
    { rootMargin: '100%' }
  );

  private __page: string | null = null;

  private __renderPage: TemplateFunction | null = null;

  get first(): string | null {
    return this.pages[0] ?? null;
  }

  set first(value: string | null) {
    this.pages.length = 0;
    if (typeof value === 'string') this.pages[0] = value;
    this.requestUpdate();
  }

  get page(): string | null {
    return this.__page;
  }

  set page(value: string | null) {
    this.__renderPage = new Function(
      'html',
      'href',
      'item',
      'lang',
      `return html\`<${value} href=\${href} item=\${item} lang=\${lang}></${value}>\``
    ) as TemplateFunction;

    this.__page = value;
    this.requestUpdate();
  }

  createRenderRoot(): HTMLElement {
    return this;
  }

  updated(): void {
    this.__observer.disconnect();
    const target = this.__lastPage;
    if (target) this.__observer.observe(target);
  }

  render(): TemplateResult {
    return html`
      ${this.pages.map(page => this.__renderPage?.(html, page, this.item!, this.lang))}
    `;
  }

  private get __lastPage() {
    return this.renderRoot.children[this.renderRoot.children.length - 1] as NucleonElement<
      any
    > | null;
  }

  private __loadNext() {
    const next = this.__lastPage?.data?._links?.next?.href as string | undefined;
    if (next) this.pages.push(next);
  }
}
