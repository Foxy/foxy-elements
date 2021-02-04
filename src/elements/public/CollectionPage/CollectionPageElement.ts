import '../Spinner';

import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { NucleonElement } from '../NucleonElement';

type Template = typeof html;
type ElementRenderer = (html: Template, lang: string, item: any) => TemplateResult;

export class CollectionPageElement extends NucleonElement<any> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      item: { type: String, noAccessor: true },
    };
  }

  private __renderItem: ElementRenderer | null = null;

  private __item: string | null = null;

  get item(): string | null {
    return this.__item;
  }

  set item(value: string | null) {
    this.__renderItem = new Function(
      'html',
      'lang',
      'data',
      `return html\`<${value} .data=\${data} lang=\${lang}></${value}>\``
    ) as ElementRenderer;

    this.__item = value;
    this.requestUpdate();
  }

  createRenderRoot(): HTMLElement {
    return this;
  }

  render(): TemplateResult {
    const data = this.state.context.data;
    const items = Array.from(Object.values(data?._embedded ?? {}) as any[]).reduce(
      (p, c) => [...p, ...c],
      [] as any[]
    );

    return html`
      ${items.map((item: any) => this.__renderItem?.(html, this.lang, item))}
      ${this.state.matches('idle')
        ? ''
        : html`
            <foxy-spinner state=${this.state.matches('fail') ? 'error' : 'busy'}> </foxy-spinner>
          `}
    `;
  }
}
