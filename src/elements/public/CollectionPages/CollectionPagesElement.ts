import { LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { RequestEvent } from '../../../events/request';
import { SpinnerElement } from '../Spinner';
import { SpinnerElementState } from '../Spinner/SpinnerElement';

type HTMLFunction = typeof html;
type Template = typeof html;
type SpinnerRenderer = (html: Template, lang: string, state: SpinnerElementState) => TemplateResult;
type TemplateFunction = (
  html: HTMLFunction,
  href: string,
  item: string,
  lang: string
) => TemplateResult;

export class CollectionPagesElement extends LitElement {
  static defaultNodeName = 'foxy-collection-pages';

  static get properties(): PropertyDeclarations {
    return {
      spinner: { type: String, noAccessor: true },
      first: { type: String, noAccessor: true },
      item: { type: String, noAccessor: true },
      page: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  lang = '';

  item: string | null = null;

  private readonly __handleRequest = (evt: Event) => {
    if (!(evt instanceof RequestEvent)) return;

    const normalizeURL = (url: string) => {
      const urlObj = new URL(url);
      const offset = parseInt(urlObj.searchParams.get('offset') ?? '0');
      const limit = parseInt(urlObj.searchParams.get('limit') ?? '0');

      if (offset === 0) urlObj.searchParams.delete('offset');
      if (limit === 0) urlObj.searchParams.delete('limit');

      return urlObj.toString();
    };

    const url = normalizeURL(evt.detail.init[0].toString());
    const method = evt.detail.init[1]?.method?.toUpperCase() ?? 'GET';

    if (method === 'POST' && this.first && url === normalizeURL(this.first)) {
      evt.detail.onResponse(response => {
        if (response.ok && this.first) {
          this._pages = [this.first];
          this.__next = null;
        }
      });
    } else {
      evt.detail.onResponse(async response => {
        const json = await response.json();
        const savedPrev = this._pages.slice(-1).pop();
        const receivedPrev = json?._links?.prev?.href;
        const newNext = json?._links?.next?.href;

        if (typeof savedPrev !== 'string') return;
        if (typeof receivedPrev !== 'string') return;
        if (typeof newNext !== 'string') return;

        if (this.__next === null && normalizeURL(receivedPrev) === normalizeURL(savedPrev)) {
          this.__next = newNext;
          this.requestUpdate();
        }
      });
    }
  };

  private readonly __observer = new IntersectionObserver(
    es => es.some(s => s.isIntersecting) && this.__loadNext(),
    { rootMargin: '100%' }
  );

  private __next: string | null = null;

  private __spinner: string | null = null;

  protected _pages: string[] = [];

  private __page: string | null = null;

  private __renderSpinner: SpinnerRenderer | null = null;

  private __renderPage: TemplateFunction | null = null;

  get first(): string | null {
    return this._pages[0] ?? null;
  }

  set first(value: string | null) {
    this._pages.length = 0;
    if (typeof value === 'string') this._pages[0] = value;
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

  get spinner(): string | null {
    return this.__spinner;
  }

  set spinner(value: string | null) {
    this.__renderSpinner = new Function(
      'html',
      'lang',
      'state',
      `return html\`<${value} lang=\${lang} state=\${state}></${value}>\``
    ) as SpinnerRenderer;

    this.__spinner = value;
    this.requestUpdate();
  }

  createRenderRoot(): HTMLElement {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('request', this.__handleRequest, { capture: true });
  }

  updated(): void {
    this.__observer.disconnect();
    const target = this.children[this.children.length - 1];
    if (target) this.__observer.observe(target);
  }

  render(): TemplateResult {
    return html`
      ${this._pages.map(page => this.__renderPage?.(html, page, this.item!, this.lang))}
      ${this.__renderSpinner?.(html, this.lang, 'busy')}
    `;
  }

  disconnectedCallback(): void {
    super.connectedCallback();
    this.removeEventListener('request', this.__handleRequest, { capture: true });
  }

  private __loadNext() {
    if (this.__next !== null) {
      this._pages.push(this.__next);
      this.__next = null;
      this.requestUpdate();
    }
  }
}
