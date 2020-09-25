import { Ruleset } from './types';

export class FrequencyModificationChangeEvent extends CustomEvent<Ruleset> {
  constructor(detail: Ruleset) {
    super('change', { detail });
  }
}
