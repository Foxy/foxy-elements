import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { HALJSONResource } from '../NucleonElement/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';

type Template = typeof html;
type ElementRenderer = (html: Template, parent: string, lang: string, item: any) => TemplateResult;
type CollectionPage = HALJSONResource & { _embedded: Record<string, unknown[]> };

export class CollectionPageElement<TData extends CollectionPage> extends NucleonElement<TData> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      item: { type: String, noAccessor: true },
    };
  }

  private __renderItem!: ElementRenderer;

  private __item!: string;

  constructor() {
    super();
    this.item = 'foxy-null';
  }

  get item(): string {
    return this.__item;
  }

  set item(value: string) {
    this.__renderItem = new Function(
      'html',
      'parent',
      'lang',
      'data',
      `return html\`<${value} data-testclass="items" parent=\${parent} .data=\${data} lang=\${lang}></${value}>\``
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
        : html`<foxy-spinner data-testid="spinner" state=${spinnerState}></foxy-spinner>`}
    `;
  }

  private get __items() {
    return Array.from(Object.values(this.form?._embedded ?? {}) as any[]).reduce(
      (p, c) => [...p, ...c],
      [] as any[]
    );
  }
}
