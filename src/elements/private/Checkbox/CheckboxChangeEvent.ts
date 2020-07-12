export class CheckboxChangeEvent extends CustomEvent<boolean> {
  constructor(newValue: boolean) {
    super('change', { detail: newValue });
  }
}
