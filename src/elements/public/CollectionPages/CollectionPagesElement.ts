import { LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { NucleonElement } from '../NucleonElement/index';
import { get } from 'lodash-es';

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

  private __page!: string;

  private __renderPage!: TemplateFunction;

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

  get page(): string {
    return this.__page;
  }

  set page(value: string) {
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
    if (this.__lastPage) this.__observer.observe(this.__lastPage);
  }

  render(): TemplateResult {
    const children = this.pages.map(page => this.__renderPage?.(html, page, this.item!, this.lang));
    return html`${children}`;
  }

  private get __lastPage() {
    type Child = NucleonElement<any> | null;
    return this.renderRoot.children[this.renderRoot.children.length - 1] as Child;
  }

  private __loadNext() {
    const next = get(this.__lastPage?.form, '_links.next.href') as string | undefined;
    if (next) this.pages.push(next);
  }
}
