export class UpdateEvent extends CustomEvent<void> {
  constructor() {
    super('update');
  }
}
