import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { HypermediaResource } from '../../private';

type Template = typeof html;
type ElementRenderer = (html: Template, lang: string, item: any) => TemplateResult;

export class CollectionPageElement extends HypermediaResource<any> {
  static defaultNodeName = 'foxy-collection-page';

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      item: { type: String, noAccessor: true },
    };
  }

  rel = 'any';

  private __renderItem: ElementRenderer | null = null;

  private __item: string | null = null;

  get item(): string | null {
    return this.__item;
  }

  set item(value: string | null) {
    this.__renderItem = new Function(
      'html',
      'lang',
      'resource',
      `return html\`<${value} .resource=\${resource} lang=\${lang}></${value}>\``
    ) as ElementRenderer;

    if (value) this.defineScopedElement(value, customElements.get(value));

    this.__item = value;
    this.requestUpdate();
  }

  createRenderRoot(): HTMLElement {
    return this;
  }

  render(): TemplateResult {
    const items = Array.from(Object.values(this.resource?._embedded ?? {}) as any[]).reduce(
      (p, c) => [...p, ...c],
      [] as any[]
    );

    return html`${items.map((item: any) => this.__renderItem?.(html, this.lang, item))}`;
  }
}
