import { Rule } from './Rule';

export class NextDateModificationChangeEvent extends CustomEvent<boolean | Rule[]> {
  constructor(value: boolean | Rule[]) {
    super('change', { detail: value });
  }
}
