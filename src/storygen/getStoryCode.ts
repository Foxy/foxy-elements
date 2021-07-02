import { TemplateResult, html } from 'lit-html';

import { Args } from './Args';
import { Summary } from './Summary';
import hljs from 'highlight.js/lib/core.js';
import parserBabel from 'prettier/esm/parser-babel.mjs';
import parserHtml from 'prettier/esm/parser-html.mjs';
import prettier from 'prettier/esm/standalone.mjs';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import xml from 'highlight.js/lib/languages/xml.js';

hljs.registerLanguage('xml', xml);

export function getStoryCode(summary: Summary, args: Args): TemplateResult {
  const { sections = [], buttons = [], inputs = [] } = summary.configurable ?? {};
  const { readonlyControls = [], disabledControls = [], hiddenControls = [] } = args;

  let code = `
    <${summary.localName}
      ${readonlyControls.length > 0 ? `readonlycontrols="${readonlyControls.join(' ')}"` : ''}
      ${disabledControls.length > 0 ? `disabledcontrols="${disabledControls.join(' ')}"` : ''}
      ${hiddenControls.length > 0 ? `hiddencontrols="${hiddenControls.join(' ')}"` : ''}
      ${args.parent ? `parent="${encodeURI(args.parent)}"` : ''}
      ${args.href ? `href="${encodeURI(args.href)}"` : ''}
      ${args.base ? `base="${encodeURI(args.base)}"` : ''}
      ${args.lang ? `lang="${encodeURI(args.lang)}"` : ''}
      ${args.hidden ? 'hidden' : ''}
      ${args.readonly ? 'readonly' : ''}
      ${args.disabled ? 'disabled' : ''}
    >
      ${[...sections, ...buttons, ...inputs]
        .reduce<string[]>((slots, name) => {
          if (name.endsWith('default')) return [...slots, name];
          return [...slots, `${name}:before`, `${name}:after`];
        }, [])
        .reduce<string>((result, slot) => {
          const html = args[slot];
          return html ? `${result}<template slot="${slot}"><div>${html}</div></template>` : result;
        }, '')}
    </${summary.localName}>
  `;

  code = prettier.format(code, {
    parser: 'babel',
    plugins: [parserBabel, parserHtml],
    printWidth: 120,
  });

  code = code.substring(0, code.length - 2); // prettier adds trailing semicolon – removing it
  code = hljs.highlightAuto(code).value;

  return html`<code class="foxy-story__code">${unsafeHTML(code)}</code>`;
}
