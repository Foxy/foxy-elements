import { html } from 'lit-html';

export const Header = (primary: string, secondary: string) => html`
  <header class="leading-s">
    <h3 class="text-header font-semibold text-l mb-xs">${primary}</h3>
    <p class="text-tertiary text-m">${secondary}</p>
  </header>
`;
