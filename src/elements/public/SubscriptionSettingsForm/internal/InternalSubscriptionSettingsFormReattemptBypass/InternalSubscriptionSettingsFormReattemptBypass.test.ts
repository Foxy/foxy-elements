import type { FetchEvent } from '../../../NucleonElement/FetchEvent';
import type { Data } from '../../types';

import '../../../NucleonElement/index';
import './index';

import { InternalSubscriptionSettingsFormReattemptBypass as Control } from './InternalSubscriptionSettingsFormReattemptBypass';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalEditableListControl } from '../../../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../../server/index';
import { I18n } from '../../../I18n/I18n';

describe('InternalSubscriptionSettingsFormReattemptBypass', () => {
  it('imports and defines vaadin-radio-button', () => {
    const element = customElements.get('vaadin-radio-button');
    expect(element).to.exist;
  });

  it('imports and defines vaadin-radio-group', () => {
    const element = customElements.get('vaadin-radio-group');
    expect(element).to.exist;
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    const element = customElements.get('foxy-internal-editable-list-control');
    expect(element).to.equal(InternalEditableListControl);
  });

  it('imports and defines foxy-internal-editable-control', () => {
    const element = customElements.get('foxy-internal-editable-control');
    expect(element).to.equal(InternalEditableControl);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines itself as foxy-internal-subscription-settings-form-reattempt-bypass', () => {
    const element = customElements.get('foxy-internal-subscription-settings-form-reattempt-bypass');
    expect(element).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('renders option group with 4 options', async () => {
    const router = createRouter();

    const element = await fixture<NucleonElement<Data>>(html`
      <foxy-nucleon
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
        <foxy-internal-subscription-settings-form-reattempt-bypass infer="">
        </foxy-internal-subscription-settings-form-reattempt-bypass>
      </foxy-nucleon>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = element.firstElementChild as Control;
    const group = control.renderRoot.querySelector('vaadin-radio-group');
    const buttons = control.renderRoot.querySelectorAll('vaadin-radio-button');
    const button0Label = buttons[0].querySelector('foxy-i18n');
    const button1Label = buttons[1].querySelector('foxy-i18n');
    const button2Label = buttons[2].querySelector('foxy-i18n');
    const button3Label = buttons[3].querySelector('foxy-i18n');

    expect(group).to.exist;
    expect(buttons).to.have.length(4);

    expect(buttons[0]).to.have.value('reattempt_if_exists');
    expect(button0Label).to.have.attribute('infer', '');
    expect(button0Label).to.have.attribute('key', 'option_reattempt_if_exists');

    expect(buttons[1]).to.have.value('skip_if_exists');
    expect(button1Label).to.have.attribute('infer', '');
    expect(button1Label).to.have.attribute('key', 'option_skip_if_exists');

    expect(buttons[2]).to.have.value('always_reattempt');
    expect(button2Label).to.have.attribute('infer', '');
    expect(button2Label).to.have.attribute('key', 'option_always_reattempt');

    expect(buttons[3]).to.have.value('never_reattempt');
    expect(button3Label).to.have.attribute('infer', '');
    expect(button3Label).to.have.attribute('key', 'option_never_reattempt');
  });

  it('passes host state to option group', async () => {
    const router = createRouter();

    const element = await fixture<NucleonElement<Data>>(html`
      <foxy-nucleon
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
        <foxy-internal-subscription-settings-form-reattempt-bypass infer="">
        </foxy-internal-subscription-settings-form-reattempt-bypass>
      </foxy-nucleon>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    const control = element.firstElementChild as Control;
    const group = control.renderRoot.querySelector('vaadin-radio-group');

    expect(group).to.have.attribute('helper-text', 'helper_text');
    expect(group).to.have.attribute('label', 'label');

    expect(group).to.not.have.attribute('disabled');
    expect(group).to.not.have.attribute('readonly');

    control.disabled = true;
    control.readonly = true;
    control.label = 'Test label';
    control.helperText = 'Test helper text';
    await control.requestUpdate();

    expect(group).to.have.attribute('disabled');
    expect(group).to.have.attribute('readonly');
    expect(group).to.have.attribute('label', 'Test label');
    expect(group).to.have.attribute('helper-text', 'Test helper text');
  });

  it('reflects nucleon form values to option group choice', async () => {
    const router = createRouter();
    const element = await fixture<NucleonElement<Data>>(html`
      <foxy-nucleon
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
        <foxy-internal-subscription-settings-form-reattempt-bypass infer="">
        </foxy-internal-subscription-settings-form-reattempt-bypass>
      </foxy-nucleon>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.firstElementChild as Control;
    const group = control.renderRoot.querySelector('vaadin-radio-group');

    element.edit({ reattempt_bypass_strings: '1,2' });
    element.edit({ reattempt_bypass_logic: 'skip_if_exists' });
    await element.requestUpdate().then(() => control.requestUpdate());
    expect(group).to.have.property('value', 'skip_if_exists');

    element.edit({ reattempt_bypass_strings: '1,2' });
    element.edit({ reattempt_bypass_logic: 'reattempt_if_exists' });
    await element.requestUpdate().then(() => control.requestUpdate());
    expect(group).to.have.property('value', 'reattempt_if_exists');

    element.edit({ reattempt_bypass_strings: '' });
    element.edit({ reattempt_bypass_logic: 'reattempt_if_exists' });
    await element.requestUpdate().then(() => control.requestUpdate());
    expect(group).to.have.property('value', 'never_reattempt');

    element.edit({ reattempt_bypass_strings: '' });
    element.edit({ reattempt_bypass_logic: 'skip_if_exists' });
    await element.requestUpdate().then(() => control.requestUpdate());
    expect(group).to.have.property('value', 'always_reattempt');
  });

  it('clears bypass strings and sets bypass logic to "reattempt_if_exists" if "never_reattempt" option is chosen', async () => {
    const router = createRouter();
    const element = await fixture<NucleonElement<Data>>(html`
      <foxy-nucleon
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
        <foxy-internal-subscription-settings-form-reattempt-bypass infer="">
        </foxy-internal-subscription-settings-form-reattempt-bypass>
      </foxy-nucleon>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.firstElementChild as Control;
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    group.value = 'never_reattempt';
    group.dispatchEvent(new CustomEvent('value-changed'));
    expect(element).to.have.nested.property('form.reattempt_bypass_logic', 'reattempt_if_exists');
    expect(element).to.have.nested.property('form.reattempt_bypass_strings', '');
  });

  it('clears bypass strings and sets bypass logic to "skip_if_exists" if "always_reattempt" option is chosen', async () => {
    const router = createRouter();
    const element = await fixture<NucleonElement<Data>>(html`
      <foxy-nucleon
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
        <foxy-internal-subscription-settings-form-reattempt-bypass infer="">
        </foxy-internal-subscription-settings-form-reattempt-bypass>
      </foxy-nucleon>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.firstElementChild as Control;
    const group = control.renderRoot.querySelector('vaadin-radio-group')!;

    group.value = 'always_reattempt';
    group.dispatchEvent(new CustomEvent('value-changed'));
    expect(element).to.have.nested.property('form.reattempt_bypass_logic', 'skip_if_exists');
    expect(element).to.have.nested.property('form.reattempt_bypass_strings', '');
  });

  it('renders editable list of bypass strings when such strings exist', async () => {
    const router = createRouter();
    const element = await fixture<NucleonElement<Data>>(html`
      <foxy-nucleon
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
        <foxy-internal-subscription-settings-form-reattempt-bypass infer="">
        </foxy-internal-subscription-settings-form-reattempt-bypass>
      </foxy-nucleon>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ reattempt_bypass_strings: '1,2,3' });
    await element.requestUpdate();

    const control = element.firstElementChild as Control;
    const list = control.renderRoot.querySelector(
      'foxy-internal-editable-list-control'
    ) as InternalEditableListControl;

    expect(list).to.have.attribute('infer', 'reattempt-bypass-strings');
    expect(list.getValue()).to.deep.equal([{ value: '1' }, { value: '2' }, { value: '3' }]);

    list.setValue([{ value: '5' }, { value: '6' }]);
    expect(element).to.have.nested.property('form.reattempt_bypass_strings', '5,6');
  });
});
