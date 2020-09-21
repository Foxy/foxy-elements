export class DonationSubmitEvent extends CustomEvent<void> {
  constructor() {
    super('submit', { cancelable: true });
  }
}
