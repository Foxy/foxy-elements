export class OffsetInputChangeEvent extends CustomEvent<string | undefined> {
  constructor(value: string | undefined) {
    super('change', { detail: value });
  }
}
