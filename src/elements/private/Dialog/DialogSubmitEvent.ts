export class DialogSubmitEvent extends CustomEvent<void> {
  constructor() {
    super('submit');
  }
}
