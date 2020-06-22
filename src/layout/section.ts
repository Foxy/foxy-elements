import { html, TemplateResult } from 'lit-html';

export function Section(...content: (TemplateResult | string)[]) {
  return html`
    <section class="space-y-m">
      ${content}
    </section>
  `;
}
