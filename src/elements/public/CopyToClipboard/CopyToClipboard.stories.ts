import './index';

import { TemplateResult, html } from 'lit-html';

export default {
  title: 'Other / CopyToClipboard',
  component: 'foxy-copy-to-clipboard',
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    icon: { control: { type: 'text' } },
    text: { control: { type: 'text' } },
    lang: { control: { type: 'text' } },
    ns: { control: { type: 'text' } },
  },
};

export const Playground = (args: Record<string, unknown>): TemplateResult => html`
  <div class="flex items-center gap-2 text-xl mb-2">
    <span>Layout: icon (default)</span>
    <foxy-copy-to-clipboard
      icon=${args.icon as string}
      text=${args.text as string}
      lang=${args.lang as string}
      ns=${args.ns as string}
      ?disabled=${args.disabled as boolean}
    >
    </foxy-copy-to-clipboard>
  </div>

  <div class="flex items-center gap-2 text-xl mb-2">
    <span>Layout: text</span>
    <foxy-copy-to-clipboard
      layout="text"
      theme="tertiary-inline"
      icon=${args.icon as string}
      text=${args.text as string}
      lang=${args.lang as string}
      ns=${args.ns as string}
      ?disabled=${args.disabled as boolean}
    >
    </foxy-copy-to-clipboard>
  </div>

  <div class="flex items-center gap-2 text-xl mb-2">
    <span>Layout: complete (text + icon)</span>
    <foxy-copy-to-clipboard
      layout="complete"
      theme="tertiary-inline"
      icon=${args.icon as string}
      text=${args.text as string}
      lang=${args.lang as string}
      ns=${args.ns as string}
      ?disabled=${args.disabled as boolean}
    >
    </foxy-copy-to-clipboard>
  </div>
`;

Playground.args = {
  disabled: false,
  icon: 'icons:content-copy',
  text: 'Text to copy',
  lang: 'en',
  ns: 'copy-to-clipboard',
};
