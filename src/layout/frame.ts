import { html, TemplateResult } from 'lit-html';

export function Frame(...content: (TemplateResult | string)[]) {
  return html`
    <div class="rounded-t-l rounded-b-l border border-shade-10">
      ${content}
    </div>
  `;
}
