import '@vaadin/vaadin-button';
import { html, TemplateResult } from 'lit-html';
import { If } from './if.js';

interface ArticleParams {
  title: string;
  subtitle: string;
  content: (string | TemplateResult)[];
  modified: boolean;
  busy: boolean;
  onSave: () => void;
}

export function Article(params: ArticleParams) {
  return html`
    <article class="bg-base font-lumo space-y-xl">
      <div class="p-m space-y-xl md:p-l lg:p-xl">
        <header class="leading-s">
          <h2 class="text-header font-semibold text-xxl mb-xs">${params.title}</h2>
          <p class="text-tertiary text-m">${params.subtitle}</p>
        </header>

        ${params.content}
      </div>

      ${If(
        params.modified || params.busy,
        () => html`
          <footer class="p-m bg-base sticky bottom-0 border-t border-shade-10">
            <vaadin-button theme="primary" .disabled=${params.busy} @click=${params.onSave}>Save changes</vaadin-button>
          </footer>
      `)}
    </article>
  `;
}
