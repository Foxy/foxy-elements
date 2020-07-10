import { fixture, expect } from '@open-wc/testing';
import { Code } from './Code';

customElements.define('x-code', Code);

describe('Code', () => {
  it('highlights the code', async () => {
    const element = await fixture<Code>(`
      <x-code>
        <template>
          <script type="module" src="test/url.js"></script>
        </template>
      </x-code>
    `);

    if (!element.ready) {
      await new Promise(resume => element.addEventListener('ready', resume));
    }

    expect(element.shadowRoot!.querySelector('code')?.innerHTML).to.equal(
      '<span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">type</span>=<span class="hljs-string">"module"</span> <span class="hljs-attr">src</span>=<span class="hljs-string">"test/url.js"</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>'
    );
  });
});
