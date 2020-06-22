import { html } from 'lit-html';

export function Hint(content: string) {
  return html`<p class="text-s text-tertiary leading-s">${content}</p>`;
}
