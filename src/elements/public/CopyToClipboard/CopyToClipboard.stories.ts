import './index';

import { TemplateResult, html } from 'lit-html';

export default {
  title: 'Other / CopyToClipboard',
  component: 'foxy-copy-to-clipboard',
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    text: { control: { type: 'text' } },
    lang: { control: { type: 'text' } },
    ns: { control: { type: 'text' } },
  },
};

export const Playground = (args: Record<string, unknown>): TemplateResult => html`
  <div class="flex items-center gap-2 text-m mb-4" style="color: var(--lumo-secondary-text-color)">
    <span>${args.text}</span>
    <foxy-copy-to-clipboard
      text=${args.text as string}
      lang=${args.lang as string}
      ns=${args.ns as string}
      ?disabled=${args.disabled as boolean}
    >
    </foxy-copy-to-clipboard>
  </div>

  <div
    class="flex items-center gap-2 text-xl font-medium mb-4"
    style="color: var(--lumo-body-text-color)"
  >
    <span>${args.text}</span>
    <foxy-copy-to-clipboard
      text=${args.text as string}
      lang=${args.lang as string}
      ns=${args.ns as string}
      ?disabled=${args.disabled as boolean}
    >
    </foxy-copy-to-clipboard>
  </div>

  <div
    class="flex items-start gap-2 text-2xl font-medium"
    style="color: var(--lumo-primary-text-color)"
  >
    <span>${new Array(16).fill(args.text).join(' ')}</span>
    <foxy-copy-to-clipboard
      text=${new Array(16).fill(args.text).join(' ')}
      lang=${args.lang as string}
      ns=${args.ns as string}
      ?disabled=${args.disabled as boolean}
    >
    </foxy-copy-to-clipboard>
  </div>
`;

Playground.args = {
  disabled: false,
  text: 'Text to copy',
  lang: 'en',
  ns: 'copy-to-clipboard',
};
