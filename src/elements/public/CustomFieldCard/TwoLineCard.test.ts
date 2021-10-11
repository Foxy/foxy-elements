import '../../internal/InternalSandbox/index';
import '../Spinner/index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TwoLineCard } from './TwoLineCard';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

class TestTwoLineCard extends TwoLineCard<any> {
  render() {
    return super.render({
      title: () => html`Title content`,
      subtitle: () => html`Subtitle content`,
    });
  }
}

customElements.define('test-two-line-card', TestTwoLineCard);

describe('CustomFieldCard', () => {
  describe('TwoLineCard', () => {
    it('extends NucleonElement', () => {
      expect(new TestTwoLineCard()).to.be.instanceOf(NucleonElement);
    });

    it('has property+attribute "lang" initialized with empty string', () => {
      expect(TestTwoLineCard.properties).to.have.deep.property('lang', { type: String });
      expect(new TestTwoLineCard()).to.have.property('lang', '');
    });

    it('has property+attribute "ns" initialized with empty string', () => {
      expect(TestTwoLineCard.properties).to.have.deep.property('ns', { type: String });
      expect(new TestTwoLineCard()).to.have.property('ns', '');
    });

    describe('title', () => {
      it('renders title content once loaded if provided', async () => {
        const data = await getTestData<any>('https://demo.foxycart.com/s/admin/custom_fields/0');
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
        const data = await getTestData<any>('https://demo.foxycart.com/s/admin/custom_fields/0');
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

    describe('spinner', () => {
      it('renders "empty" foxy-spinner by default', async () => {
        const layout = html`<test-two-line-card lang="es" ns="foo"></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        const spinner = await getByTestId(element, 'spinner');
        const wrapper = spinner!.parentElement;

        expect(wrapper).not.to.have.class('opacity-0');
        expect(spinner).to.have.attribute('state', 'empty');
        expect(spinner).to.have.attribute('lang', 'es');
        expect(spinner).to.have.attribute('ns', 'foo spinner');
      });

      it('renders "busy" foxy-spinner while loading', async () => {
        const layout = html`<test-two-line-card href="/" lang="es" ns="foo"></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        const spinner = await getByTestId(element, 'spinner');
        const wrapper = spinner!.parentElement;

        expect(wrapper).not.to.have.class('opacity-0');
        expect(spinner).to.have.attribute('state', 'busy');
        expect(spinner).to.have.attribute('lang', 'es');
        expect(spinner).to.have.attribute('ns', 'foo spinner');
      });

      it('renders "error" foxy-spinner if loading fails', async () => {
        const layout = html`<test-two-line-card href="/" lang="es" ns="foo"></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        const spinner = await getByTestId(element, 'spinner');
        const wrapper = spinner!.parentElement;

        await waitUntil(() => element.in('fail'));

        expect(wrapper).not.to.have.class('opacity-0');
        expect(spinner).to.have.attribute('state', 'error');
        expect(spinner).to.have.attribute('lang', 'es');
        expect(spinner).to.have.attribute('ns', 'foo spinner');
      });

      it('hides the spinner once loaded', async () => {
        const data = await getTestData<any>('https://demo.foxycart.com/s/admin/custom_fields/0');
        const layout = html`<test-two-line-card .data=${data}></test-two-line-card>`;
        const element = await fixture<TestTwoLineCard>(layout);
        const spinner = await getByTestId(element, 'spinner');

        expect(spinner!.parentElement).to.have.class('opacity-0');
      });
    });
  });
});
