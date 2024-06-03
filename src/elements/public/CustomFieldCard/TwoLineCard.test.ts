import '../../internal/InternalSandbox/index';
import '../Spinner/index';

import { expect, fixture, html } from '@open-wc/testing';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { TwoLineCard } from './TwoLineCard';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { InternalCard } from '../../internal/InternalCard/InternalCard';

class TestTwoLineCard extends TwoLineCard<any> {
  renderBody() {
    return super.renderBody({
      title: () => html`Title content`,
      subtitle: () => html`Subtitle content`,
    });
  }
}

customElements.define('test-two-line-card', TestTwoLineCard);

describe('CustomFieldCard', () => {
  describe('TwoLineCard', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('extends InternalCard', () => {
      expect(new TestTwoLineCard()).to.be.instanceOf(InternalCard);
    });

    describe('title', () => {
      it('renders title content once loaded if provided', async () => {
        const data = await getTestData<any>('./hapi/custom_fields/0');
        const layout = html`<test-two-line-card .data=${data}></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        const title = await getByTestId(element, 'title');

        expect(title).to.include.text('Title content');
      });

      it('renders "title:before" slot by default', async () => {
        const layout = html`<test-two-line-card></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByName(element, 'title:before')).to.have.property('localName', 'slot');
      });

      it('replaces "title:before" slot with template "title:before" if available', async () => {
        const name = 'title:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<TestTwoLineCard>(html`
          <test-two-line-card>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </test-two-line-card>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "title:after" slot by default', async () => {
        const layout = html`<test-two-line-card></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByName(element, 'title:after')).to.have.property('localName', 'slot');
      });

      it('replaces "title:after" slot with template "title:after" if available', async () => {
        const name = 'title:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<TestTwoLineCard>(html`
          <test-two-line-card>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </test-two-line-card>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is visible by default', async () => {
        const layout = html`<test-two-line-card></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByTestId(element, 'title')).to.exist;
      });

      it('is hidden when card is hidden', async () => {
        const layout = html`<test-two-line-card hidden></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByTestId(element, 'title')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes "title"', async () => {
        const layout = html`<test-two-line-card hiddencontrols="title"></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByTestId(element, 'title')).to.not.exist;
      });
    });

    describe('subtitle', () => {
      it('renders subtitle content once loaded if provided', async () => {
        const data = await getTestData<any>('./hapi/custom_fields/0');
        const layout = html`<test-two-line-card .data=${data}></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        const title = await getByTestId(element, 'subtitle');

        expect(title).to.include.text('Subtitle content');
      });

      it('renders "subtitle:before" slot by default', async () => {
        const layout = html`<test-two-line-card></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByName(element, 'subtitle:before')).to.have.property('localName', 'slot');
      });

      it('replaces "subtitle:before" slot with template "subtitle:before" if available', async () => {
        const name = 'subtitle:before';
        const subtitle = `<p>subtitle of the "${name}" template.</p>`;
        const element = await fixture<TestTwoLineCard>(html`
          <test-two-line-card>
            <template slot=${name}>${unsafeHTML(subtitle)}</template>
          </test-two-line-card>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(subtitle);
      });

      it('renders "subtitle:after" slot by default', async () => {
        const layout = html`<test-two-line-card></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByName(element, 'subtitle:after')).to.have.property('localName', 'slot');
      });

      it('replaces "subtitle:after" slot with template "subtitle:after" if available', async () => {
        const name = 'subtitle:after';
        const subtitle = `<p>subtitle of the "${name}" template.</p>`;
        const element = await fixture<TestTwoLineCard>(html`
          <test-two-line-card>
            <template slot=${name}>${unsafeHTML(subtitle)}</template>
          </test-two-line-card>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(subtitle);
      });

      it('is visible by default', async () => {
        const layout = html`<test-two-line-card></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByTestId(element, 'subtitle')).to.exist;
      });

      it('is hidden when card is hidden', async () => {
        const layout = html`<test-two-line-card hidden></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByTestId(element, 'subtitle')).to.not.exist;
      });

      it('is hidden when hiddencontrols includes subtitle', async () => {
        const layout = html`<test-two-line-card hiddencontrols="subtitle"></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        expect(await getByTestId(element, 'subtitle')).to.not.exist;
      });
    });
  });
});
