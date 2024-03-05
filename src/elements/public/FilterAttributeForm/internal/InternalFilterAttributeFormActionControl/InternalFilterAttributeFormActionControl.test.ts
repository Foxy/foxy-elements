import type { NucleonElement } from '../../../NucleonElement/NucleonElement';

import '../../../NucleonElement/index';
import '../../index';
import './index';

import { InternalFilterAttributeFormActionControl as Control } from './InternalFilterAttributeFormActionControl';
import { expect, fixture, html } from '@open-wc/testing';
import { getByKey } from '../../../../../testgen/getByKey';
import { stub } from 'sinon';
import { getTestData } from '../../../../../testgen/getTestData';

describe('FilterAttributeForm', () => {
  describe('InternalFilterAttributeFormActionControl', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('defines foxy-internal-control', () => {
      const localName = 'foxy-internal-control';
      expect(customElements.get(localName)).to.exist;
    });

    it('defines vaadin-button', () => {
      const localName = 'vaadin-button';
      expect(customElements.get(localName)).to.exist;
    });

    it('defines foxy-i18n', () => {
      const localName = 'foxy-i18n';
      expect(customElements.get(localName)).to.exist;
    });

    it('defines itself as foxy-internal-filter-attribute-form-action-control', () => {
      const localName = 'foxy-internal-filter-attribute-form-action-control';
      expect(customElements.get(localName)).to.equal(Control);
    });

    it('renders create button if conditions are met', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-filter-attribute-form-action-control
            infer="action"
          ></foxy-internal-filter-attribute-form-action-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      const label = await getByKey(control, 'create');
      const button = label?.closest('vaadin-button');

      expect(label).to.exist;
      expect(button).to.exist;

      const submitMethod = stub(nucleon, 'submit');
      button?.click();
      expect(submitMethod).to.have.been.called;
    });

    it('renders update button if conditions are met', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-filter-attribute-form-action-control
            infer="action"
          ></foxy-internal-filter-attribute-form-action-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      let label = await getByKey(control, 'update');
      expect(label).to.not.exist;

      nucleon.data = (await getTestData('./hapi/store_attributes/0')) as any;
      await nucleon.requestUpdate();
      await control.requestUpdate();
      label = await getByKey(control, 'update');
      expect(label).to.not.exist;

      nucleon.edit({ value: 'test' });
      await nucleon.requestUpdate();
      await control.requestUpdate();
      label = await getByKey(control, 'update');
      expect(label).to.exist;

      const button = label?.closest('vaadin-button');
      const submitMethod = stub(nucleon, 'submit');

      expect(button).to.exist;
      button?.click();
      expect(submitMethod).to.have.been.called;
    });

    it('renders reset button if conditions are met', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-filter-attribute-form-action-control
            infer="action"
          ></foxy-internal-filter-attribute-form-action-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      let label = await getByKey(control, 'reset');
      expect(label).to.not.exist;

      nucleon.data = (await getTestData('./hapi/store_attributes/0')) as any;
      await nucleon.requestUpdate();
      await control.requestUpdate();
      label = await getByKey(control, 'reset');
      expect(label).to.not.exist;

      nucleon.edit({ value: 'test' });
      await nucleon.requestUpdate();
      await control.requestUpdate();
      label = await getByKey(control, 'reset');
      expect(label).to.exist;

      const button = label?.closest('vaadin-button');
      const undoMethod = stub(nucleon, 'undo');

      expect(button).to.exist;
      button?.click();
      expect(undoMethod).to.have.been.called;
    });

    it('renders delete button if conditions are met', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-filter-attribute-form-action-control
            infer="action"
          ></foxy-internal-filter-attribute-form-action-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      let label = await getByKey(control, 'delete');
      expect(label).to.not.exist;

      nucleon.data = (await getTestData('./hapi/store_attributes/0')) as any;
      await nucleon.requestUpdate();
      await control.requestUpdate();
      label = await getByKey(control, 'delete');
      expect(label).to.exist;

      const button = label?.closest('vaadin-button');
      const deleteMethod = stub(nucleon, 'delete');

      expect(button).to.exist;
      button?.click();
      expect(deleteMethod).to.have.been.called;
    });

    it('keeps buttons enabled by default', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-nucleon>
          <foxy-internal-filter-attribute-form-action-control
            infer="action"
          ></foxy-internal-filter-attribute-form-action-control>
        </foxy-nucleon>
      `);

      const control = nucleon.firstElementChild as Control;
      let buttons = control.renderRoot.querySelectorAll('[disabled]');
      expect(buttons).to.be.empty;

      nucleon.data = (await getTestData('./hapi/store_attributes/0')) as any;
      await nucleon.requestUpdate();
      await control.requestUpdate();
      buttons = control.renderRoot.querySelectorAll('[disabled]');
      expect(buttons).to.be.empty;

      nucleon.edit({ value: 'test' });
      await nucleon.requestUpdate();
      await control.requestUpdate();
      buttons = control.renderRoot.querySelectorAll('[disabled]');
      expect(buttons).to.be.empty;
    });

    it('disables buttons if disabled', async () => {
      const nucleon = await fixture<NucleonElement<any>>(html`
        <foxy-filter-attribute-form disabled>
          <foxy-internal-filter-attribute-form-action-control
            infer="action"
          ></foxy-internal-filter-attribute-form-action-control>
        </foxy-filter-attribute-form>
      `);

      const control = nucleon.querySelector('[infer="action"]') as Control;
      let buttons = control.renderRoot.querySelectorAll('[disabled]');
      expect(buttons).to.be.empty;

      nucleon.data = (await getTestData('./hapi/store_attributes/0')) as any;
      await nucleon.requestUpdate();
      await control.requestUpdate();
      buttons = control.renderRoot.querySelectorAll('[disabled]');
      expect(buttons).to.not.be.empty;

      nucleon.edit({ value: 'test' });
      await nucleon.requestUpdate();
      await control.requestUpdate();
      buttons = control.renderRoot.querySelectorAll('[disabled]');
      expect(buttons).to.not.be.empty;
    });
  });
});
