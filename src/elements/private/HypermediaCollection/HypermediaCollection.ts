import { ElementContext, ElementEvent, Resource } from '../HypermediaResource/types';
import { Interpreter, interpret } from 'xstate';

import { PropertyDeclarations } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { machine } from '../HypermediaResource/machine';

export type Collection = Resource & {
  _links: {
    next: { href: string };
  };
};

export abstract class HypermediaCollection<T extends Collection> extends Translatable {
  static get properties(): PropertyDeclarations {
    return {
      pages: { attribute: false, noAccessor: true },
      first: { type: String, noAccessor: true },
    };
  }

  private __resources: Interpreter<ElementContext<T>, any, ElementEvent<T>>[] = [];

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
  }

  get pages(): T[] {
    return this.__resources
      .map(resourceMachine => resourceMachine.state.context.resource)
      .filter(v => v !== null) as T[];
  }

  updated(): void {
    this.__observer.disconnect();
    if (this._trigger) this.__observer.observe(this._trigger);
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

  protected abstract get _trigger(): HTMLElement | null;

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
