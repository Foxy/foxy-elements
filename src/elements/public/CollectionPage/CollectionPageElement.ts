import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { NucleonElement } from '../NucleonElement/index';

type Template = typeof html;
type ElementRenderer = (html: Template, parent: string, lang: string, item: any) => TemplateResult;

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
      'parent',
      'lang',
      'form',
      `return html\`<${value} parent=\${parent} .form=\${form} lang=\${lang}></${value}>\``
    ) as ElementRenderer;

    this.__item = value;
    this.requestUpdate();
  }

  createRenderRoot(): HTMLElement {
    return this;
  }

  render(): TemplateResult {
    const items = this.__items;
    const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';

    return html`
      ${items.map((item: any) => this.__renderItem?.(html, this.href, this.lang, item))}
      ${this.in('idle') && items.length > 0
        ? ''
        : html`<foxy-spinner state=${spinnerState}></foxy-spinner>`}
    `;
  }

  private get __items() {
    return Array.from(Object.values(this.form?._embedded ?? {}) as any[]).reduce(
      (p, c) => [...p, ...c],
      [] as any[]
    );
  }
}
