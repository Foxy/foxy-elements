export class ItemsFormChangeEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('change', { detail });
  }
}

export class ItemsFormSubmitEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('submit', { detail });
  }
}

export class ItemsFormResponseEvent extends CustomEvent<ProgressEvent<EventTarget>> {
  constructor(detail: ProgressEvent<EventTarget>) {
    super('load', { detail });
  }
}
