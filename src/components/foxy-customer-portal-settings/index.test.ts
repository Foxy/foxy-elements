import { fixture, expect, elementUpdated } from '@open-wc/testing';
import { testRegistration } from '../../utils/test-registration';
import { testStatefulMixin } from '../../utils/test-stateful-mixin';
import { testTranslatableMixin } from '../../utils/test-translatable-mixin';
import { FoxyCustomerPortalSettings as constructor, tag } from './index';

import {
  sampleResource,
  initialState,
  sampleState,
  sampleEvent,
  minimalResource,
} from './fixtures';

async function expectResourceToRender(node: constructor) {
  if (node.resource?.allowedOrigins) {
    const items = node.shadowRoot!.querySelectorAll(`#originsList li`);
    expect(node.resource.allowedOrigins.length).to.equal(items.length);

    Array.from(items).forEach((item, index) => {
      expect(item.textContent).to.include(node.resource!.allowedOrigins[index]);
    });
  }

  const ndModCheckbox = node.shadowRoot!.querySelector('[name=ndMod]');
  expect(ndModCheckbox).to.have.property(
    'checked',
    Boolean(node.resource?.subscriptions.allowNextDateModification)
  );
}

describe('foxy-customer-portal-settings', () => {
  testRegistration({ tag, constructor });
  testTranslatableMixin({ tag });
  testStatefulMixin({
    sampleResource,
    initialState,
    sampleState,
    sampleEvent,
    tag,
  });

  let node: constructor;

  beforeEach(async () => {
    node = await fixture(`<${tag}></${tag}>`);
    node.resource = minimalResource;
  });

  it('can add origin with .send()', async () => {
    const value = 'https://example.com';
    node.send({ type: 'addOrigin', value });
    await elementUpdated(node);

    expect(node.resource!.allowedOrigins).to.include(value);
    expectResourceToRender(node);
  });

  it('can add origin through UI', async () => {
    const root = node.shadowRoot!;
    const value = 'https://example.com';
    const input = root.querySelector('[name=newOrigin]');
    const button = root.querySelector('[name=newOrigin] ~ vaadin-button');

    (input as HTMLInputElement).value = value;
    (button as HTMLButtonElement).click();
    await elementUpdated(node);

    expect(node.resource!.allowedOrigins).to.include(value);
    expectResourceToRender(node);
  });

  it('can remove origin with .send()', async () => {
    node.resource!.allowedOrigins = ['https://example.com'];
    node.send({ type: 'removeOrigin', index: 0 });
    await elementUpdated(node);

    expect(node.resource!.allowedOrigins).to.be.empty;
    expectResourceToRender(node);
  });

  it('can remove origin through UI', async () => {
    node.resource!.allowedOrigins = ['https://example.com'];
    await node.requestUpdate();

    const root = node.shadowRoot!;
    const button = root.querySelector(`#originsList li button`);

    (button as HTMLButtonElement).click();
    await elementUpdated(node);

    expect(node.resource!.allowedOrigins).to.be.empty;
    expectResourceToRender(node);
  });

  it('can enable next date modification with .send()', async () => {
    node.send({ type: 'enableNdMod' });
    expect(node.resource!.subscriptions.allowNextDateModification).to.be.true;
    expectResourceToRender(node);
  });

  it('can enable next date modification through UI', async () => {
    const ndModCheckbox = node.shadowRoot!.querySelector('[name=ndMod]');

    (ndModCheckbox as HTMLInputElement).checked = true;
    (ndModCheckbox as HTMLInputElement).dispatchEvent(new Event('change'));

    await elementUpdated(node);
    expect(node.resource!.subscriptions.allowNextDateModification).to.be.true;
    expectResourceToRender(node);
  });

  it('can disable next date modification with .send()', async () => {
    node.send({ type: 'disableNdMod' });
    expect(node.resource!.subscriptions.allowNextDateModification).to.be.false;
    expectResourceToRender(node);
  });

  it('can disable next date modification through UI', async () => {
    node.resource!.subscriptions.allowNextDateModification = true;
    await node.requestUpdate();

    const ndModCheckbox = node.shadowRoot!.querySelector('[name=ndMod]');

    (ndModCheckbox as HTMLInputElement).checked = false;
    (ndModCheckbox as HTMLInputElement).dispatchEvent(new Event('change'));

    await elementUpdated(node);
    expect(node.resource!.subscriptions.allowNextDateModification).to.be.false;
    expectResourceToRender(node);
  });
});
