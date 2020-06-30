import { StateValue } from 'xstate/dist/xstate.web.js';

export class TransitionEvent extends CustomEvent<StateValue> {
  constructor(state: StateValue) {
    super('transition', { detail: state });
  }
}
