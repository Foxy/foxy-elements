import { html, TemplateResult } from 'lit-html';

export function Group(...content: (TemplateResult | string)[]) {
  return html`
    <div class="space-y-s">
      ${content}
    </div>
  `;
}
