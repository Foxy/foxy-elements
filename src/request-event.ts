export interface RequestEventDetail {
  intercept: (fetch: Window['fetch']) => void;
}

export class RequestEvent extends CustomEvent<RequestEventDetail> {
  constructor(detail: RequestEventDetail) {
    super('request', {
      composed: true,
      bubbles: true,
      detail,
    });
  }
}
