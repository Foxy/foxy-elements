export class QuickOrderChangeEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('change', { detail });
  }
}

export class QuickOrderSubmitEvent extends CustomEvent<FormData> {
  constructor(detail: FormData) {
    super('submit', { detail });
  }
}

export class QuickOrderResponseEvent extends CustomEvent<ProgressEvent<EventTarget>> {
  constructor(detail: ProgressEvent<EventTarget>) {
    super('load', { detail });
  }
}
