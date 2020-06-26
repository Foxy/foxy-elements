import { html } from 'lit-html';

export function Warning(content: string) {
  return html`
    <p class="flex text-s bg-primary-10 rounded p-m text-primary leading-s">
      <iron-icon icon="lumo:error" class="flex-shrink-0 mr-m"></iron-icon>
      ${content}
    </p>`;
}
