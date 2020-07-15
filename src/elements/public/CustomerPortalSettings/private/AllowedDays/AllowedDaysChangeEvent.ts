import { Rule } from './AllowedDays';

export class AllowedDaysChangeEvent extends CustomEvent<Rule | undefined> {
  constructor(value: Rule | undefined) {
    super('change', { detail: value });
  }
}
