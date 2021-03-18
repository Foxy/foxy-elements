export class DialogHideEvent extends CustomEvent<{ cancelled: boolean }> {
  constructor(cancelled = false) {
    super('hide', { detail: { cancelled } });
  }
}
