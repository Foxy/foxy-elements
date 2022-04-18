import '@vaadin/vaadin-button';
import './index';
import '../CustomerCard/index';

import { TemplateResult, html } from 'lit-html';

export default {
  title: 'Other / SwipeActions',
};

export const Playground = (): TemplateResult => html`
  ${new Array(10).fill(0).map(
    () => html`
      <foxy-swipe-actions class="block rounded-lg overflow-hidden">
        <foxy-customer-card
          class="rounded-lg p-3"
          style="background-color: var(--lumo-contrast-5pct)"
          href="https://demo.api/hapi/customers/0"
        >
        </foxy-customer-card>

        <vaadin-button class="rounded-lg h-full m-0 py-0 px-6 ml-2" theme="contrast" slot="action">
          Copy email
        </vaadin-button>

        <vaadin-button
          class="rounded-lg h-full m-0 py-0 px-6 ml-2"
          theme="primary error"
          slot="action"
        >
          Delete
        </vaadin-button>
      </foxy-swipe-actions>

      <div class="py-2"></div>
    `
  )}
`;
