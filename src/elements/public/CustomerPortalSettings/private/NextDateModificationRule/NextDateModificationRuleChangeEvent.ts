import { Rule } from './Rule';

export class NextDateModificationRuleChangeEvent extends CustomEvent<Rule> {
  constructor(value: Rule) {
    super('change', { detail: value });
  }
}
