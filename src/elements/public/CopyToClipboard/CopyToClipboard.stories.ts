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
  <div class="flex items-center gap-2 text-m mb-4 text-gray-500">
    <span>${args.text}</span>
    <foxy-copy-to-clipboard
      text=${args.text}
      lang=${args.lang}
      ns=${args.ns}
      ?disabled=${args.disabled}
    >
    </foxy-copy-to-clipboard>
  </div>

  <div class="flex items-center gap-2 text-xl font-semibold mb-4">
    <span>${args.text}</span>
    <foxy-copy-to-clipboard
      text=${args.text}
      lang=${args.lang}
      ns=${args.ns}
      ?disabled=${args.disabled}
    >
    </foxy-copy-to-clipboard>
  </div>

  <div class="flex items-start gap-2 text-2xl font-bold text-blue-500">
    <span>${new Array(16).fill(args.text).join(' ')}</span>
    <foxy-copy-to-clipboard
      text=${new Array(16).fill(args.text).join(' ')}
      lang=${args.lang}
      ns=${args.ns}
      ?disabled=${args.disabled}
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
