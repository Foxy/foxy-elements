import { ElementContext, ElementEvent, Resource } from '../../private/HypermediaResource/types';
import { Interpreter, interpret } from 'xstate';
import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { SpinnerElementState } from '../Spinner/SpinnerElement';
import { machine } from '../../private/HypermediaResource/machine';

type Template = typeof html;
type SpinnerRenderer = (html: Template, lang: string, state: SpinnerElementState) => TemplateResult;
type ElementRenderer = (html: Template, lang: string, item: any) => TemplateResult;

type Collection = Resource & {
  _links: {
    next: { href: string };
  };
};

export class CollectionItemsElement<T extends Collection> extends LitElement {
  static readonly defaultNodeName = 'foxy-collection-items';

  static get properties(): PropertyDeclarations {
    return {
      element: { type: String, noAccessor: true },
      spinner: { type: String, noAccessor: true },
      first: { type: String, noAccessor: true },
      lang: { type: String },
    };
  }

  lang = '';

  private __renderElement: ElementRenderer | null = null;

  private __renderSpinner: SpinnerRenderer | null = null;

  private __resources: Interpreter<ElementContext<T>, any, ElementEvent<T>>[] = [];

  private __element: string | null = null;

  private __spinner: string | null = null;

  private __href: string | null = null;

  private readonly __observer = new IntersectionObserver(
    es => es.some(s => s.isIntersecting) && this.__loadNext(),
    { rootMargin: '100%' }
  );

  get first(): string | null {
    return this.__href;
  }

  set first(value: string | null) {
    this.__href = value;
    this.__resources = [];
    this.requestUpdate().then(() => this.__loadNext());
  }

  get element(): string | null {
    return this.__element;
  }

  set element(value: string | null) {
    this.__renderElement = new Function(
      'html',
      'lang',
      'resource',
      `return html\`<${value} .resource=\${resource} lang=\${lang}></${value}>\``
    ) as ElementRenderer;

    this.__element = value;
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

  updated(): void {
    this.__observer.disconnect();
    if (this._trigger) this.__observer.observe(this._trigger);
  }

  render(): TemplateResult {
    const items = this.__resources
      .map(v => v.state.context.resource)
      .filter(v => v !== null)
      .reduce((p, c) => [...p, ...Object.values((c as any)._embedded)], [] as any[])
      .reduce((p, c) => [...p, ...c], [] as any[]);

    return html`
      ${items.map((item: any) => this.__renderElement?.(html, this.lang, item))}
      ${this.__renderSpinner?.(html, this.lang, 'busy')}
    `;
  }

  protected _is(state: string): boolean {
    return this.__resources.some(resourceMachine => resourceMachine.state.matches(state));
  }

  protected _getLimit(): number {
    const defaultLimit = 20;

    try {
      const strLimit = new URL(this.first ?? '').searchParams.get('limit');
      const intLimit = strLimit ? parseInt(strLimit) : defaultLimit;
      return isNaN(intLimit) ? defaultLimit : intLimit;
    } catch {
      return defaultLimit;
    }
  }

  protected get _trigger(): Element | null {
    return this.children[this.children.length - 1] ?? null;
  }

  private __loadNext() {
    if (this._is('busy')) return;

    const lastResourceService = this.__resources[this.__resources.length - 1];
    const lastResource = lastResourceService?.state.context.resource ?? null;

    this.__resources.push(
      interpret(
        machine.withContext({
          resourceV8N: {},
          resource: null,
          element: this,
          backup: null,
          errors: [],
          href: lastResource?._links.next.href ?? this.first ?? null,
        })
      )
        .onChange(() => this.requestUpdate())
        .onTransition(({ changed }) => changed && this.requestUpdate())
        .start()
    );
  }
}
