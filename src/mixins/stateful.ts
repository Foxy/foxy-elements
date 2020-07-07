import { property } from 'lit-element';

import {
  EventObject,
  interpret,
  Interpreter,
  StateMachine,
  StateSchema,
} from 'xstate/dist/xstate.web.js';

import { RequestEvent } from '../events/request';
import { Translatable } from './translatable';

/**
 * Machine factory function accepting a `window.fetch` interceptor.
 * If you create a rel-specific element, its machine factory MUST
 * extend this type.
 */
export type MachineFactory<
  TContext,
  TStateSchema extends StateSchema<unknown>,
  TEvent extends EventObject
> = (fetch: Window['fetch']) => StateMachine<TContext, TStateSchema, TEvent>;

/**
 * The base class for each rel-specific element in the collection
 * facilitating XState integration and adding common events, properties and methods
 * related to that functionality.
 *
 * @see https://xstate.js.org/docs/
 *
 * This class MUST NOT be used on its own (hence the `abstract` keyword) or
 * referenced externally (outside of the package).
 *
 * @template TContext State machine context interface.
 * @template TStateSchema Interface describing state structure.
 * @template TEvent Union type describing events that can be sent to the state machine.
 */
export abstract class Stateful<
  TContext,
  TStateSchema extends StateSchema<unknown>,
  TEvent extends EventObject
> extends Translatable {
  /** Active interpreter service (can be shut down and replaced). */
  @property()
  public service: Interpreter<TContext, TStateSchema, TEvent>;

  /**
   * Creates an instance of the class and starts the interpreter.
   *
   * @param createMachine State machine factory accepting the `fetch` interceptor as argument.
   * @param namespace Name of the folder translations for this component are stored in. Usually a node name without vendor prefix.
   */
  constructor(
    private __createMachine: MachineFactory<TContext, TStateSchema, TEvent>,
    namespace: string
  ) {
    super(namespace);

    const machine = this.__createMachine(this.__interceptFetch());
    this.service = interpret(machine, { devTools: true }).start();
    this.service.onChange(() => this.requestUpdate());
    this.service.onTransition(state => state.changed && this.requestUpdate());
  }

  /**
   * Creates a fetch interceptor for use in machine factory.
   * Fetch interceptor has the same interface as `window.fetch`, allowing
   * external code to modify the request before sending, use a different
   * channel for data transmission (e.g. Web Sockets) or perform additional checks
   * on the payload. Used in `request` event payload (instance of `RequestEvent`).
   *
   * Example client code:
   * @example
   *
   * statefulElement.addEventListener('request', ({ detail }) => {
   *   detail.intercept(async (url, { body }) => {
   *     const data = await makeCustomRequest(url, body);
   *     return new Response(JSON.stringify(data));
   *   });
   * });
   */
  private __interceptFetch(): Window['fetch'] {
    return (...args: Parameters<Window['fetch']>) =>
      new Promise((resolve, reject) =>
        this.dispatchEvent(
          new RequestEvent({
            intercept: async runCustomFetch => {
              try {
                resolve(await runCustomFetch(...args));
              } catch (err) {
                reject(err);
              }
            },
          })
        )
      );
  }
}
