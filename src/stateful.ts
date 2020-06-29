import { internalProperty, property } from 'lit-element';
import { isEqual, isMatchWith } from 'lodash-es';

import {
  EventObject,
  interpret,
  Interpreter,
  State,
  StateMachine,
  StateSchema,
  StateValue,
} from 'xstate';

import { ChangeEvent } from './change-event.js';
import { RequestEvent } from './request-event.js';
import { TransitionEvent } from './transition-event.js';
import { Translatable } from './translatable.js';

/**
 * Base structure for any rel-specific element. If you create one, its
 * context MUST implement this interface.
 */
export interface RelContext {
  resource?: object;
}

/**
 * Machine factory function accepting a `window.fetch` interceptor.
 * If you create a rel-specific element, its machine factory MUST
 * extend this type.
 */
export type MachineFactory<
  TContext extends RelContext,
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
  TContext extends RelContext,
  TStateSchema extends StateSchema<unknown>,
  TEvent extends EventObject
> extends Translatable {
  /** State machine generated with machine factory. */
  protected readonly _machine: StateMachine<TContext, TStateSchema, TEvent>;

  /** Active interpreter service (can be shut down and replaced). */
  @internalProperty()
  protected _service: Interpreter<TContext, TStateSchema, TEvent>;

  /** Current context accessor shortcut. */
  protected get _context(): TContext {
    return this._service.state.context;
  }

  /**
   * Component state value – can be a string for simple machines
   * and an object for more complex ones. Changes in state are communicated
   * to the external code via the `transition` event (instance of `TransitionEvent`).
   *
   * This property SHOULD be treated as read-only. If you need to use the setter,
   * please first see if you can switch this component to the desired state by sending
   * one of the supported events to the machine. Setting this property will restart
   * the interpreter, effectively resetting all running services and activities.
   */
  @property({
    type: Object,
    hasChanged(before: object, after: object) {
      return !isEqual(before, after);
    },
  })
  public get state(): StateValue {
    return this._service.state.value;
  }
  public set state(value: StateValue) {
    this._service.stop();
    this._service = this.__spawn(this._machine.initialState.context, value);
  }

  /**
   * Full resource object or `undefined` for no-content state. Changes in
   * resource are communicated to the external code via the `change` event (instance
   * of `ChangeEvent`).
   *
   * Setting this property will neither restart the interpreter nor affect any
   * running services or activities.
   */
  @property({
    type: Object,
    hasChanged(before: object, after: object) {
      return (
        !isEqual(before, after) &&
        !isMatchWith(before, after, (a, b) => {
          if (Array.isArray(a) && Array.isArray(b) && a.length !== b.length) {
            return false;
          }
        })
      );
    },
  })
  public get resource(): TContext['resource'] {
    return this._machine.initialState.context.resource;
  }
  public set resource(value: TContext['resource']) {
    this._service.state.context.resource = value;
  }

  /**
   * Creates an instance of the class and starts the interpreter.
   *
   * @param createMachine State machine factory accepting the `fetch` interceptor as argument.
   * @param namespace Name of the folder translations for this component are stored in. Usually a node name without vendor prefix.
   */
  constructor(
    createMachine: MachineFactory<TContext, TStateSchema, TEvent>,
    namespace: string
  ) {
    super(namespace);
    this._machine = createMachine(this.__interceptFetch());
    this._service = this.__spawn();
  }

  /**
   * Sends an event to the running interpreter to trigger a transition.
   * @param event Event to send.
   */
  public send(event: TEvent): State<TContext, TEvent, TStateSchema> {
    return this._service.send(event);
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

  /**
   * Creates, starts and returns an interpreter with given context and state.
   *
   * @param context Initial context to use in state machine.
   * @param state Initial state to start the machine in.
   */
  private __spawn(
    context: TContext = this._machine.initialState.context,
    state: StateValue = this._machine.initialState.value
  ): Interpreter<TContext, TStateSchema, TEvent> {
    const machine = this._machine.withContext(context);
    const interpreter = interpret(machine, { devTools: true });

    interpreter.onChange(value => {
      this.dispatchEvent(new ChangeEvent<TContext>(value));
      this.requestUpdate();
    });

    interpreter.onTransition(({ value, changed }) => {
      if (changed) {
        this.dispatchEvent(new TransitionEvent(value));
        this.requestUpdate();
      }
    });

    return interpreter.start(state);
  }
}
