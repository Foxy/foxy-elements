import { LitElement, PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { RequestEvent } from '../../../events/request';

type HTMLFunction = typeof html;
type TemplateFunction = (html: HTMLFunction, href: string, lang: string) => TemplateResult;

export class CollectionPagesElement extends LitElement {
  static readonly defaultNodeName = 'foxy-collection-pages';

  static get properties(): PropertyDeclarations {
    return {
      element: { type: String, noAccessor: true },
      first: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  lang = '';

  private readonly __handleRequest = (evt: Event) => {
    if (!(evt instanceof RequestEvent)) return;

    evt.detail.onResponse(async response => {
      const normalizeURL = (url: string) => {
        const urlObj = new URL(url);
        const offset = parseInt(urlObj.searchParams.get('offset') ?? '0');
        const limit = parseInt(urlObj.searchParams.get('limit') ?? '0');

        if (offset === 0) urlObj.searchParams.delete('offset');
        if (limit === 0) urlObj.searchParams.delete('limit');

        return urlObj.toString();
      };

      const json = await response.json();
      const savedPrev = this.__pages.slice(-1).pop();
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
  };

  private readonly __observer = new IntersectionObserver(
    es => es.some(s => s.isIntersecting) && this.__loadNext(),
    { rootMargin: '100%' }
  );

  private __next: string | null = null;

  private __pages: string[] = [];

  private __element: string | null = null;

  private __renderElement: TemplateFunction | null = null;

  get first(): string | null {
    return this.__pages[0] ?? null;
  }

  set first(value: string | null) {
    this.__pages.length = 0;
    if (typeof value === 'string') this.__pages[0] = value;
    this.requestUpdate();
  }

  get element(): string | null {
    return this.__element;
  }

  set element(value: string | null) {
    this.__renderElement = new Function(
      'html',
      'href',
      'lang',
      `return html\`<${value} href=\${href} lang=\${lang}></${value}>\``
    ) as TemplateFunction;

    this.__element = value;
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
    this.__observer.observe(this.children[this.children.length - 1]);
  }

  render(): TemplateResult {
    return html`${this.__pages.map(page => this.__renderElement?.(html, page, this.lang))}`;
  }

  disconnectedCallback(): void {
    super.connectedCallback();
    this.removeEventListener('request', this.__handleRequest, { capture: true });
  }

  private __loadNext() {
    if (this.__next !== null) {
      this.__pages.push(this.__next);
      this.__next = null;
      this.requestUpdate();
    }
  }
}
