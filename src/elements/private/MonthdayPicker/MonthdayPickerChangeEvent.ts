export class MonthdayPickerChangeEvent extends CustomEvent<number[]> {
  constructor(value: number[]) {
    super('change', { detail: value });
  }
}
