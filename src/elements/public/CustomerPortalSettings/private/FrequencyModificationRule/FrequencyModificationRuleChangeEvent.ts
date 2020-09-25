import { Rule } from './types';

export class FrequencyModificationRuleChangeEvent extends CustomEvent<Rule> {
  constructor(detail: Rule) {
    super('change', { detail });
  }
}
