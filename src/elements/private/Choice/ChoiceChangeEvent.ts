export class ChoiceChangeEvent extends CustomEvent<null | string | string[]> {
  constructor(value: null | string | string[]) {
    super('change', { detail: value });
  }
}
