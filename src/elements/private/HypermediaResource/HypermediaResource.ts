import { Element, element } from './element.machine';

import { PropertyDeclarations } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { interpret } from 'xstate';

export abstract class HypermediaResource<T> extends Translatable {
  static get properties(): PropertyDeclarations {
    return {
      resource: { attribute: false, noAccessor: true },
      href: { type: String, noAccessor: true },
    };
  }

  private readonly __machine = element.withContext({
    resource: null,
    element: this,
    error: null,
    href: null,
  }) as Element<T>;

  private readonly __service = interpret(this.__machine)
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .onChange(() => this.requestUpdate())
    .start();

  get href(): string | null {
    return this.__service.state.context.href;
  }

  set href(value: string | null) {
    this.__service.send('SET_HREF', { data: value });
  }

  get resource(): T | null {
    return this.__service.state.context.resource;
  }

  set resource(value: T | null) {
    this.__service.send('SET_RESOURCE', { data: value });
  }

  abstract readonly rel: string;

  firstUpdated(): void {
    this.updateComplete.then(() => this._reload());
  }

  protected _reload(): void {
    this.__service.send('RELOAD');
  }

  protected _save(): void {
    this.__service.send('SAVE');
  }

  protected _is(state: string): boolean {
    return this.__service.state.matches(state);
  }
}
