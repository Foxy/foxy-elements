export class CodeReadyEvent extends CustomEvent<void> {
  constructor() {
    super('ready');
  }
}
