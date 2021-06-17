export class ItemsFormChangeEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('change', { detail });
  }
}

export class ItemsFormSubmitEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('submit', { cancelable: true, detail });
  }
}
