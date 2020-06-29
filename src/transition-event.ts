import { StateValue } from 'xstate';

export class TransitionEvent extends CustomEvent<StateValue> {
  constructor(state: StateValue) {
    super('transition', { detail: state });
  }
}
