export class ChoiceChangeEvent extends CustomEvent<string> {
  constructor(value: string) {
    super('change', { detail: value });
  }
}
