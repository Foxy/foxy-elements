import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../../../server/index';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { InternalSourceControl } from '../../../../internal/InternalSourceControl/InternalSourceControl';
import { FetchEvent } from '../../../NucleonElement/FetchEvent';
import { SwipeActions } from '../../../SwipeActions/SwipeActions';
import { InternalApiBrowserResourceForm } from './index';

describe('ApiBrowser', () => {
  describe('InternalApiBrowserResourceForm', () => {
    it('imports and defines vaadin-button', () => {
      expect(customElements.get('vaadin-button')).to.exist;
    });

    it('imports and defines iron-icon', () => {
      expect(customElements.get('iron-icon')).to.exist;
    });

    it('imports and defines foxy-internal-source-control', () => {
      expect(customElements.get('foxy-internal-source-control')).to.exist;
    });

    it('imports and defines foxy-internal-delete-control', () => {
      expect(customElements.get('foxy-internal-delete-control')).to.exist;
    });

    it('imports and defines foxy-internal-create-control', () => {
      expect(customElements.get('foxy-internal-create-control')).to.exist;
    });

    it('imports and defines foxy-internal-form', () => {
      expect(customElements.get('foxy-internal-form')).to.exist;
    });

    it('imports and defines foxy-copy-to-clipboard', () => {
      expect(customElements.get('foxy-copy-to-clipboard')).to.exist;
    });

    it('imports and defines foxy-swipe-actions', () => {
      expect(customElements.get('foxy-swipe-actions')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('imports and defines itself as foxy-internal-api-browser-resource-form', () => {
      expect(customElements.get('foxy-internal-api-browser-resource-form')).to.equal(
        InternalApiBrowserResourceForm
      );
    });

    it('extends InternalForm', () => {
      expect(new InternalApiBrowserResourceForm()).to.be.instanceOf(InternalForm);
    });

    it('has an empty i18n namespace by default', () => {
      expect(InternalApiBrowserResourceForm).to.have.property('defaultNS', '');
      expect(new InternalApiBrowserResourceForm()).to.have.property('ns', '');
    });

    it('has a reactive property "open" (Boolean, reflected, false by default)', () => {
      expect(InternalApiBrowserResourceForm).to.have.nested.property(
        'properties.open.type',
        Boolean
      );

      expect(InternalApiBrowserResourceForm).to.have.nested.property(
        'properties.open.reflect',
        true
      );

      expect(new InternalApiBrowserResourceForm()).to.have.property('open', false);
    });

    it('renders details bound to the form state', async () => {
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form></foxy-internal-api-browser-resource-form>
      `);

      const details = form.renderRoot.querySelector('details') as HTMLDetailsElement;
      expect(details).to.exist;

      form.open = true;
      await form.updateComplete;

      expect(details).to.have.property('open', true);

      form.open = false;
      await form.updateComplete;

      expect(details).to.have.property('open', false);

      details.open = true;
      details.dispatchEvent(new CustomEvent('toggle'));

      expect(form).to.have.property('open', true);

      details.open = false;
      details.dispatchEvent(new CustomEvent('toggle'));

      expect(form).to.have.property('open', false);
    });

    it('renders a foxy-copy-to-clipboard bound to the .href value if available', async () => {
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form href="https://demo.api/hapi/customers/0">
        </foxy-internal-api-browser-resource-form>
      `);

      const ctcb = form.renderRoot.querySelector(
        'foxy-copy-to-clipboard[text="https://demo.api/hapi/customers/0"]'
      );

      expect(ctcb).to.exist;
      expect(ctcb).to.have.property('infer', 'copy-to-clipboard');
    });

    it('renders a foxy-copy-to-clipboard bound to the .parent value if .href is unavailable', async () => {
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form parent="https://demo.api/hapi/customers">
        </foxy-internal-api-browser-resource-form>
      `);

      const ctcb = form.renderRoot.querySelector(
        'foxy-copy-to-clipboard[text="https://demo.api/hapi/customers"]'
      );

      expect(ctcb).to.exist;
      expect(ctcb).to.have.property('infer', 'copy-to-clipboard');
    });

    it('renders path + search in the summary in GET mode', async () => {
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form href="https://demo.api/hapi/customers?email=foo">
        </foxy-internal-api-browser-resource-form>
      `);

      const summary = form.renderRoot.querySelector('summary');

      expect(summary).to.exist;
      expect(summary).to.include.text('hapi/customers?email=foo');
    });

    it('renders path + search in the summary in POST mode', async () => {
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form parent="https://demo.api/hapi/customers?email=foo">
        </foxy-internal-api-browser-resource-form>
      `);

      const summary = form.renderRoot.querySelector('summary');

      expect(summary).to.exist;
      expect(summary).to.include.text('hapi/customers?email=foo');
    });

    it('renders foxy-internal-create-control in idle.snapshot.dirty and idle.template states', async () => {
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form></foxy-internal-api-browser-resource-form>
      `);

      let control = form.renderRoot.querySelector('foxy-internal-create-control');

      expect(control).to.exist;
      expect(control).to.have.property('infer', 'create');

      form.href = 'https://demo.api/hapi/customers/0';
      await form.updateComplete;

      control = form.renderRoot.querySelector('foxy-internal-create-control');
      expect(control).to.not.exist;

      form.data = null;
      await form.updateComplete;

      control = form.renderRoot.querySelector('foxy-internal-create-control');
      expect(control).to.exist;
    });

    it('renders Undo button in dirty states', async () => {
      const router = createRouter();
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-api-browser-resource-form>
      `);

      let button = form.renderRoot.querySelector('[data-testid="undo"]');
      let caption = button?.querySelector('foxy-i18n[key="undo"][infer=""]');

      expect(button).to.not.exist;
      expect(caption).to.not.exist;

      form.edit({ first_name: 'Test' } as any);
      await form.updateComplete;

      button = form.renderRoot.querySelector('[data-testid="undo"]');
      caption = button?.querySelector('foxy-i18n[key="undo"][infer=""]');

      expect(button).to.exist;
      expect(caption).to.exist;

      button?.dispatchEvent(new CustomEvent('click'));
      expect(form).to.not.have.nested.property('form.first_name', 'Test');

      form.href = 'https://demo.api/hapi/customers/0';
      await waitUntil(() => form.in({ idle: 'snapshot' }));

      button = form.renderRoot.querySelector('[data-testid="undo"]');
      caption = button?.querySelector('foxy-i18n[key="undo"][infer=""]');

      expect(button).to.not.exist;
      expect(caption).to.not.exist;

      form.edit({ first_name: 'Test' } as any);
      await form.updateComplete;

      button = form.renderRoot.querySelector('[data-testid="undo"]');
      caption = button?.querySelector('foxy-i18n[key="undo"][infer=""]');

      expect(button).to.exist;
      expect(caption).to.exist;

      button?.dispatchEvent(new CustomEvent('click'));
      expect(form).to.not.have.nested.property('form.first_name', 'Test');
    });

    it('renders foxy-internal-delete-control in idle.snapshot state', async () => {
      const router = createRouter();
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form
          href="https://demo.api/hapi/customers/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-api-browser-resource-form>
      `);

      await waitUntil(() => form.in({ idle: 'snapshot' }));

      let control = form.renderRoot.querySelector('foxy-internal-delete-control');

      expect(control).to.exist;
      expect(control).to.have.property('infer', 'delete');

      form.data = null;
      await form.updateComplete;

      control = form.renderRoot.querySelector('foxy-internal-delete-control');
      expect(control).to.not.exist;
    });

    it('renders a source control with form data when open', async () => {
      const router = createRouter();
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form
          href="https://demo.api/hapi/customers/0"
          open
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-api-browser-resource-form>
      `);

      await waitUntil(() => form.in({ idle: 'snapshot' }));

      const control = form.renderRoot.querySelector<InternalSourceControl>(
        'foxy-internal-source-control'
      )!;

      expect(control.getValue()).to.include(
        JSON.stringify(
          form.form,
          Object.keys(form.form).filter(key => !key.startsWith('_')),
          2
        )
      );

      form.data = null;
      await form.updateComplete;
      control.setValue('{ "first_name": "Test" }');

      expect(form).to.have.deep.property('form', { first_name: 'Test' });
    });

    it('renders resource links', async () => {
      const router = createRouter();
      const form = await fixture<InternalApiBrowserResourceForm>(html`
        <foxy-internal-api-browser-resource-form
          href="https://demo.api/hapi/customers/0"
          open
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-internal-api-browser-resource-form>
      `);

      await waitUntil(() => form.in({ idle: 'snapshot' }));
      const links = [...form.renderRoot.querySelectorAll('[data-testclass="link"]')];

      expect(links).to.have.length(Object.keys(form.data!._links).length - 1);

      for (const curie in form.data!._links) {
        if (curie === 'self') continue;
        const link = links.find(link => link.textContent?.includes(curie))!;

        expect(link).to.exist;
        expect(link).to.include.text(curie);
        expect(link).to.include.text(form.data!._links[curie].href);

        const actions = link.querySelector('foxy-swipe-actions') as SwipeActions;
        expect(actions).to.exist;

        const getButton = actions.querySelector('button:not([slot])')!;
        expect(getButton).to.exist;

        const whenGotGetEvent = oneEvent(form, 'navigate:get');
        getButton.dispatchEvent(new CustomEvent('click'));
        const getEvent = await whenGotGetEvent;

        expect(getEvent).to.have.property('bubbles', true);
        expect(getEvent).to.have.property('detail', form.data!._links[curie].href);

        const postButton = actions.querySelector('[slot="action"] vaadin-button')!;
        expect(postButton).to.exist;

        const whenGotPostEvent = oneEvent(form, 'navigate:post');
        postButton.dispatchEvent(new CustomEvent('click'));
        const postEvent = await whenGotPostEvent;

        expect(postEvent).to.have.property('bubbles', true);
        expect(postEvent).to.have.property('detail', form.data!._links[curie].href);
      }
    });
  });
});
