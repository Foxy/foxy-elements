import { DialogElement } from './DialogElement';
import { PropertyDeclarations } from 'lit-element';
import { RequestEvent } from '../../../events/request';

export abstract class HypermediaResourceDialog extends DialogElement {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String },
    };
  }

  href: string | null = null;

  private __handleRequest = (evt: Event) => {
    if (!(evt instanceof RequestEvent)) return;

    const url = evt.detail.init[0].toString();
    const method = evt.detail.init[1]?.method?.toUpperCase();

    if (url === this.href && method === 'DELETE') {
      evt.detail.onResponse(response => {
        if (response.ok) this.open = false;
      });
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    addEventListener('request', this.__handleRequest, { capture: true });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    removeEventListener('request', this.__handleRequest, { capture: true });
  }
}
