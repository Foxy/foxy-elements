export class SSOSwitchChangeEvent extends CustomEvent<boolean> {
  constructor(value: boolean) {
    super('change', { detail: value });
  }
}
