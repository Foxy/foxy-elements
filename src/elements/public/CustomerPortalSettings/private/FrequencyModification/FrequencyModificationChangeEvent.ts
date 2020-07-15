import { FrequencyModificationRule } from './FrequencyModificationRule';

export class FrequencyModificationChangeEvent extends CustomEvent<
  FrequencyModificationRule | boolean
> {
  constructor(value: FrequencyModificationRule | boolean) {
    super('change', { detail: value });
  }
}
