export class ListChangeEvent extends CustomEvent<string[]> {
  constructor(value: string[]) {
    super('change', { detail: value });
  }
}
