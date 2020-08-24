export class QuickOrderChangeEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('change', { detail });
  }
}
