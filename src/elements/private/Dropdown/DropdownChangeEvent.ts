export class DropdownChangeEvent extends CustomEvent<string | null> {
  constructor(detail: string | null) {
    super('change', { detail });
  }
}
