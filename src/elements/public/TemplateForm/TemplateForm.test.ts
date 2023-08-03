import './index';

import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Choice } from '../../private';
import { ChoiceChangeEvent } from '../../private/events';
import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { I18n } from '../I18n/I18n';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { TemplateForm } from './TemplateForm';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { createRouter } from '../../../server';
import { InternalSourceControl } from '../../internal/InternalSourceControl/InternalSourceControl';

describe('TemplateForm', () => {
  it('extends NucleonElement', () => {
    expect(new TemplateForm()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-template-form', () => {
    expect(customElements.get('foxy-template-form')).to.equal(TemplateForm);
  });

  it('has a default i18next namespace of "template-form"', () => {
    expect(new TemplateForm()).to.have.property('ns', 'template-form');
  });

  describe('description', () => {
    it('has i18n label key "description"', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'description');

      expect(control).to.have.property('label', 'description');
    });

    it('has value of form.description', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      element.edit({ description: 'Test template' });

      const control = await getByTestId<TextFieldElement>(element, 'description');
      expect(control).to.have.property('value', 'Test template');
    });

    it('writes to form.description on input', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'description');

      control!.value = 'Test template';
      control!.dispatchEvent(new CustomEvent('input'));

      expect(element).to.have.nested.property('form.description', 'Test template');
    });

    it('submits valid form on enter', async () => {
      const validData = await getTestData<Data>('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId<TextFieldElement>(element, 'description');
      const submit = stub(element, 'submit');

      element.data = validData;
      element.edit({ description: 'Test template', content: '' });
      control!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('renders "description:before" slot by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByName(element, 'description:before')).to.have.property('localName', 'slot');
    });

    it('replaces "description:before" slot with template "description:before" if available', async () => {
      const description = 'description:before';
      const value = `<p>Value of the "${description}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form>
          <template slot=${description}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, description);
      const sandbox = (await getByTestId<InternalSandbox>(element, description))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "description:after" slot by default', async () => {
      const element = await fixture<TemplateForm>(html`<foxy-template-form></foxy-template-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'description:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "description:after" slot with template "description:after" if available', async () => {
      const description = 'description:after';
      const value = `<p>Value of the "${description}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form>
          <template slot=${description}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, description);
      const sandbox = (await getByTestId<InternalSandbox>(element, description))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-form readonly></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes description', async () => {
      const layout = html`<foxy-template-form readonlycontrols="description"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-template-form href=${href}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-template-form href=${href}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-form disabled></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes description', async () => {
      const layout = html`<foxy-template-form disabledcontrols="description"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-form hidden></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.not.exist;
    });

    it('is hidden when hiddencontrols includes description', async () => {
      const layout = html`<foxy-template-form hiddencontrols="description"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'description')).to.not.exist;
    });
  });

  describe('content', () => {
    it('has i18n label key "template"', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;

      expect(await getByKey(control, 'template')).to.exist;
    });

    it('renders a choice element with content types', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;

      expect(choice).to.be.instanceOf(Choice);
      expect(choice).to.have.deep.property('items', ['default', 'url', 'clipboard']);
    });

    it('pre-selects default content type by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;

      expect(choice).to.have.property('value', 'default');
    });

    it('pre-selects url content type if content_url is set', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      expect(choice).to.have.property('value', 'url');
    });

    it('pre-selects clipboard content type if content is set', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content: 'Test Template' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      expect(choice).to.have.property('value', 'clipboard');
    });

    it('clears content and content_url on choice change', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content: 'Test Template', content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      choice.dispatchEvent(new ChoiceChangeEvent('url'));
      await element.updateComplete;

      expect(choice).to.have.property('value', 'url');
      expect(element.form).to.have.property('content', '');
      expect(element.form).to.have.property('content_url', '');
    });

    ['default', 'url', 'clipboard'].forEach(contentType => {
      it(`renders title for choice "${contentType}"`, async () => {
        const layout = html`<foxy-template-form></foxy-template-form>`;
        const element = await fixture<TemplateForm>(layout);
        const control = (await getByTestId(element, 'content')) as HTMLElement;
        const choice = (await getByTestId(control, 'content-type')) as Choice;
        const wrapper = choice.querySelector(`[slot="${contentType}-label"]`) as HTMLElement;

        expect(await getByKey(wrapper, `template_${contentType}`)).to.exist;
      });
    });

    it('shows url field for url content type', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const wrapper = choice.querySelector('[slot="url"]');
      expect(wrapper).to.not.have.attribute('hidden');
    });

    it('sets value of form.content_url to the text field', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const wrapper = choice.querySelector('[slot="url"]') as HTMLElement;
      const field = await getByTestId(wrapper, 'content-url');

      expect(field).to.have.value('https://example.com');
    });

    it('content url field writes to form.content_url on input', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const wrapper = choice.querySelector('[slot="url"]') as HTMLElement;
      const field = (await getByTestId(wrapper, 'content-url')) as TextFieldElement;

      field.value = 'https://example.com/foo';
      field.dispatchEvent(new CustomEvent('input'));

      expect(element.form).to.have.property('content_url', 'https://example.com/foo');
    });

    it('content url field submits valid form on Enter', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const submit = stub(element, 'submit');
      element.edit({ description: 'Test', content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const wrapper = choice.querySelector('[slot="url"]') as HTMLElement;
      const field = (await getByTestId(wrapper, 'content-url')) as TextFieldElement;
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(submit).to.have.been.called;
    });

    it('shows Cache button next to the content url field', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content_url: 'https://example.com' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const wrapper = choice.querySelector('[slot="url"]') as HTMLElement;
      const button = (await getByTestId(wrapper, 'cache')) as ButtonElement;

      expect(button).to.exist;
      expect(button.firstElementChild).to.have.property('key', 'cache');
      expect(button.firstElementChild).to.be.instanceOf(I18n);
    });

    it('POSTs to fx:cache once Cache button is clicked', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.data = await getTestData('./hapi/cart_templates/0');

      const whenFetchEventFired = oneEvent(element, 'fetch') as unknown as Promise<FetchEvent>;
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const wrapper = choice.querySelector('[slot="url"]') as HTMLElement;
      const button = (await getByTestId(wrapper, 'cache')) as ButtonElement;
      button.click();

      const event = await whenFetchEventFired;
      expect(event).to.have.nested.property('request.url', element.data?._links['fx:cache'].href);
      expect(event).to.have.nested.property('request.method', 'POST');
    });

    it('shows source control for clipboard content type', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      element.edit({ content: 'Test Template' });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const field = choice.querySelector('[slot="clipboard"]');

      expect(field).to.have.attribute('placeholder', 'clipboard_source_placeholder');
      expect(field).to.have.attribute('label', 'clipboard_source_label');
      expect(field).to.have.attribute('infer', 'content');

      expect(field).to.not.have.attribute('hidden');
      expect(field).to.be.instanceOf(InternalSourceControl);
    });

    it('shows source control for url content type', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      element.edit({
        content_url: 'https://example.com/template',
        content: 'Test Template',
      });

      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = (await getByTestId(control, 'content-type')) as Choice;
      const group = choice.querySelector('[slot="url"]');
      const field = group?.querySelector('foxy-internal-source-control');

      expect(field).to.have.attribute('placeholder', 'url_source_placeholder');
      expect(field).to.have.attribute('label', 'url_source_label');
      expect(field).to.have.attribute('infer', 'content');

      expect(field).to.be.instanceOf(InternalSourceControl);
    });

    it('is editable by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');

      expect(choice).not.to.have.attribute('readonly');
      expect(urlField).not.to.have.attribute('readonly');
    });

    it('is readonly when element is readonly', async () => {
      const layout = html`<foxy-template-form readonly></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');

      expect(choice).to.have.attribute('readonly');
      expect(urlField).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes content', async () => {
      const layout = html`<foxy-template-form readonlycontrols="content"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');

      expect(choice).to.have.attribute('readonly');
      expect(urlField).to.have.attribute('readonly');
    });

    it('is enabled by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');
      const cacheButton = await getByTestId(control, 'cache');

      expect(choice).not.to.have.attribute('disabled');
      expect(urlField).not.to.have.attribute('disabled');
      expect(cacheButton).not.to.have.attribute('disabled');
    });

    it('is disabled when form is loading', async () => {
      const href = 'https://demo.api/virtual/stall';
      const layout = html`<foxy-template-form href=${href}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');
      const cacheButton = await getByTestId(control, 'cache');

      expect(choice).to.have.attribute('disabled');
      expect(urlField).to.have.attribute('disabled');
      expect(cacheButton).to.have.attribute('disabled');
    });

    it('is disabled when form has failed to load data', async () => {
      const href = 'https://demo.api/virtual/empty?status=404';
      const layout = html`<foxy-template-form href=${href}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');
      const cacheButton = await getByTestId(control, 'cache');

      expect(choice).to.have.attribute('disabled');
      expect(urlField).to.have.attribute('disabled');
      expect(cacheButton).to.have.attribute('disabled');
    });

    it('is disabled when element is disabled', async () => {
      const layout = html`<foxy-template-form disabled></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');
      const cacheButton = await getByTestId(control, 'cache');

      expect(choice).to.have.attribute('disabled');
      expect(urlField).to.have.attribute('disabled');
      expect(cacheButton).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes content', async () => {
      const layout = html`<foxy-template-form disabledcontrols="content"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;
      const choice = await getByTestId(control, 'content-type');
      const urlField = await getByTestId(control, 'content-url');
      const cacheButton = await getByTestId(control, 'cache');

      expect(choice).to.have.attribute('disabled');
      expect(urlField).to.have.attribute('disabled');
      expect(cacheButton).to.have.attribute('disabled');
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;

      expect(control).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-template-form hidden></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;

      expect(control).to.not.exist;
    });

    it('is hidden when hiddencontrols includes content', async () => {
      const layout = html`<foxy-template-form hiddencontrols="content"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = (await getByTestId(element, 'content')) as HTMLElement;

      expect(control).to.not.exist;
    });
  });

  describe('timestamps', () => {
    it('once form data is loaded, renders a property table with created and modified dates', async () => {
      const data = await getTestData<Data>('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId(element, 'timestamps');
      const items = [
        { name: 'date_modified', value: 'date' },
        { name: 'date_created', value: 'date' },
      ];

      expect(control).to.have.deep.property('items', items);
    });

    it('once form data is loaded, renders "timestamps:before" slot', async () => {
      const data = await getTestData<Data>('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:before" slot with template "timestamps:before" if available', async () => {
      const data = await getTestData<Data>('./hapi/cart_templates/0');
      const name = 'timestamps:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once form data is loaded, renders "timestamps:after" slot', async () => {
      const data = await getTestData<Data>('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'timestamps:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('once form data is loaded, replaces "timestamps:after" slot with template "timestamps:after" if available', async () => {
      const data = await getTestData<Data>('./hapi/cart_templates/0');
      const name = 'timestamps:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('create', () => {
    it('if data is empty, renders create button', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'create')).to.exist;
    });

    it('renders with i18n key "create" for caption', async () => {
      const layout = html`<foxy-template-form lang="es"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId(element, 'create');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'create');
      expect(caption).to.have.attribute('ns', 'template-form');
    });

    it('renders disabled if form is disabled', async () => {
      const layout = html`<foxy-template-form disabled></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is invalid', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      element.edit({ description: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "create"', async () => {
      const layout = html`<foxy-template-form disabledcontrols="create"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'create')).to.have.attribute('disabled');
    });

    it('submits valid form on click', async () => {
      const element = await fixture<TemplateForm>(html`<foxy-template-form></foxy-template-form>`);
      const submit = stub(element, 'submit');
      element.edit({ description: 'Foo' });

      const control = await getByTestId<ButtonElement>(element, 'create');
      control!.dispatchEvent(new CustomEvent('click'));

      expect(submit).to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const layout = html`<foxy-template-form hidden></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "create"', async () => {
      const layout = html`<foxy-template-form hiddencontrols="create"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      expect(await getByTestId(element, 'create')).to.not.exist;
    });

    it('renders with "create:before" slot by default', async () => {
      const layout = html`<foxy-template-form></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'create:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:before" slot with template "create:before" if available and rendered', async () => {
      const name = 'create:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "create:after" slot by default', async () => {
      const element = await fixture<TemplateForm>(html`<foxy-template-form></foxy-template-form>`);
      const slot = await getByName<HTMLSlotElement>(element, 'create:after');
      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "create:after" slot with template "create:after" if available and rendered', async () => {
      const name = 'create:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('delete', () => {
    it('renders delete button once resource is loaded', async () => {
      const href = './hapi/cart_templates/0';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-template-form .data=${data} disabled></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      expect(await getByTestId(element, 'delete')).to.exist;
    });

    it('renders with i18n key "delete" for caption', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data} lang="es"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId(element, 'delete');
      const caption = control?.firstElementChild;

      expect(caption).to.have.property('localName', 'foxy-i18n');
      expect(caption).to.have.attribute('lang', 'es');
      expect(caption).to.have.attribute('key', 'delete');
      expect(caption).to.have.attribute('ns', 'template-form');
    });

    it('renders disabled if form is disabled', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data} disabled></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if form is sending changes', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      element.edit({ description: 'Foo' });
      element.submit();

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('renders disabled if disabledcontrols includes "delete"', async () => {
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form
          .data=${await getTestData<Data>('./hapi/cart_templates/0')}
          disabledcontrols="delete"
        >
        </foxy-template-form>
      `);

      expect(await getByTestId(element, 'delete')).to.have.attribute('disabled');
    });

    it('shows deletion confirmation dialog on click', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const control = await getByTestId<ButtonElement>(element, 'delete');
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const showMethod = stub(confirm!, 'show');

      control!.dispatchEvent(new CustomEvent('click'));

      expect(showMethod).to.have.been.called;
    });

    it('deletes resource if deletion is confirmed', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(false));

      expect(deleteMethod).to.have.been.called;
    });

    it('keeps resource if deletion is cancelled', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const confirm = await getByTestId<InternalConfirmDialog>(element, 'confirm');
      const deleteMethod = stub(element, 'delete');

      confirm!.dispatchEvent(new InternalConfirmDialog.HideEvent(true));

      expect(deleteMethod).not.to.have.been.called;
    });

    it("doesn't render if form is hidden", async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data} hidden></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('doesn\'t render if hiddencontrols includes "delete"', async () => {
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form
          .data=${await getTestData<Data>('./hapi/cart_templates/0')}
          hiddencontrols="delete"
        >
        </foxy-template-form>
      `);

      expect(await getByTestId(element, 'delete')).to.not.exist;
    });

    it('renders with "delete:before" slot by default', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:before" slot with template "delete:before" if available and rendered', async () => {
      const href = './hapi/cart_templates/0';
      const name = 'delete:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders with "delete:after" slot by default', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const slot = await getByName<HTMLSlotElement>(element, 'delete:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "delete:after" slot with template "delete:after" if available and rendered', async () => {
      const href = './hapi/cart_templates/0';
      const name = 'delete:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<TemplateForm>(html`
        <foxy-template-form .data=${await getTestData<Data>(href)}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-template-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-template-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-template-form>
      `;

      const element = await fixture<TemplateForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'template-form spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = './hapi/not-found';
      const layout = html`<foxy-template-form href=${href} lang="es"></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'template-form spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('./hapi/cart_templates/0');
      const layout = html`<foxy-template-form .data=${data}></foxy-template-form>`;
      const element = await fixture<TemplateForm>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
