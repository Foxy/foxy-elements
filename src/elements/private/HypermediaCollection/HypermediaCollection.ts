import { Collection, Slider, machine } from './machine';

import { PropertyDeclarations } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { interpret } from 'xstate';

export abstract class HypermediaCollection<T extends Collection> extends Translatable {
  static get properties(): PropertyDeclarations {
    return {
      pages: { attribute: false, noAccessor: true },
      first: { type: String, noAccessor: true },
    };
  }

  private readonly __observer = new IntersectionObserver(
    es => es.some(s => s.isIntersecting) && this.__service.send('LOAD_NEXT'),
    { rootMargin: '100%' }
  );

  private readonly __machine = machine.withContext({
    first: null,
    error: null,
    pages: [],
    element: this,
  }) as Slider<T>;

  private readonly __service = interpret(this.__machine)
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .onChange(() => this.requestUpdate())
    .start();

  get first(): string | null {
    return this.__service.state.context.first;
  }

  set first(value: string | null) {
    this.__service.send('SET_FIRST', { data: value });
  }

  get pages(): T[] {
    return this.__service.state.context.pages;
  }

  set pages(value: T[]) {
    this.__service.send('SET_PAGES', { data: value });
  }

  updated(): void {
    this.__observer.disconnect();
    if (this._trigger) this.__observer.observe(this._trigger);
  }

  protected _is(state: string): boolean {
    return this.__service.state.matches(state);
  }

  protected abstract get _trigger(): HTMLElement | null;
}
