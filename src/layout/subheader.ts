import { html } from 'lit-html';

export function Subheader(content: string) {
  return html`<h4 class="text-s text-tertiary">${content}</h4>`;
}
