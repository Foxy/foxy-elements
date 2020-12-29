import { ElementContext, ElementError, ElementEvent, Resource } from './types';
import { StateMachine, interpret } from 'xstate';

import { PropertyDeclarations } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { machine } from './machine';

export abstract class HypermediaResource<T extends Resource> extends Translatable {
  static get properties(): PropertyDeclarations {
    return {
      resource: { attribute: false, noAccessor: true },
      href: { type: String, noAccessor: true },
    };
  }

  private readonly __machine = machine.withContext({
    resource: null,
    element: this,
    backup: null,
    errors: [],
    href: null,
  }) as StateMachine<ElementContext<T>, any, ElementEvent<T>>;

  private readonly __service = interpret(this.__machine)
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .onChange(() => this.requestUpdate())
    .start();

  get errors(): ElementError[] {
    return this.__service.state.context.errors;
  }

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

  protected _setProperty(resource: T): void {
    this.__service.send('SET_PROPERTY', resource);
  }

  protected _restore(): void {
    this.__service.send('RELOAD');
  }

  protected _reload(): void {
    this.__service.send('RELOAD');
  }

  protected _submit(): void {
    this.__service.send('SUBMIT');
  }

  protected _is(state: string): boolean {
    return this.__service.state.matches(state);
  }
}
