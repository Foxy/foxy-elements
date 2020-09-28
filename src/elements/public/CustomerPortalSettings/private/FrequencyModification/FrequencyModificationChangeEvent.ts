import { Rule } from '../FrequencyModificationRule/types';

export class FrequencyModificationChangeEvent extends CustomEvent<Rule[]> {
  constructor(detail: Rule[]) {
    super('change', { detail });
  }
}
