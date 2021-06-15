import { expect, fixture } from '@open-wc/testing';

import { Tabs } from './Tabs';
import { html } from 'lit-html';

customElements.define('x-tabs', Tabs);

/**
 * @param element
 * @param size
 * @param value
 */
async function testLayout(element: Tabs, size: number, value: number) {
  expect(element).to.have.property('value', value);
  expect(element).to.have.property('size', size);

  const tabPanels = element.renderRoot.querySelectorAll('[role=tabpanel]');
  const tabList = element.renderRoot.querySelector('[role=tablist]');
  const tabs = element.renderRoot.querySelectorAll('[role=tab]');

  expect(tabPanels).to.have.length(size);
  expect(tabList).to.have.attribute('aria-orientation', 'horizontal');
  expect(tabs).to.have.length(size);

  tabPanels.forEach((tabPanel, tabPanelIndex) => {
    expect(tabPanel).to.have.attribute('aria-labelledby', `tab-${tabPanelIndex}`);
    expect(tabPanel).to.have.attribute('name', `panel-${tabPanelIndex}`);
    expect(tabPanel).to.have.property('localName', 'slot');
    expect(tabPanel).to.have.id(`panel-${tabPanelIndex}`);

    if (tabPanelIndex === value) {
      expect(tabPanel).to.have.attribute('aria-hidden', 'false');
      expect(tabPanel).not.to.have.class('hidden');
    } else {
      expect(tabPanel).to.have.attribute('aria-hidden', 'true');
      expect(tabPanel).to.have.class('hidden');
    }
  });

  tabs.forEach((tab, tabIndex) => {
    expect(tab).to.have.attribute('aria-controls', `panel-${tabIndex}`);
    expect(tab).to.have.id(`tab-${tabIndex}`);

    const slot = tab.querySelector(`slot[name="tab-${tabIndex}"]`);
    expect(slot).to.exist;

    if (tabIndex === value) {
      expect(tab).to.have.attribute('aria-selected', 'true');
    } else {
      expect(tab).to.have.attribute('aria-selected', 'false');
    }
  });
}

describe('Tabs', () => {
  it('renders empty tab list by default', async () => {
    const template = html`<x-tabs></x-tabs>`;
    const element = await fixture<Tabs>(template);

    expect(element).to.have.property('value', 0);
    expect(element).to.have.property('size', 0);

    const tabPanels = element.renderRoot.querySelectorAll('[role=tabpanel]');
    const tabList = element.renderRoot.querySelector('[role=tablist]');
    const tabs = element.renderRoot.querySelectorAll('[role=tab]');

    expect(tabPanels).to.be.empty;
    expect(tabList).to.have.attribute('aria-orientation', 'horizontal');
    expect(tabs).to.be.empty;
  });

  it('renders element.size number of tabs with active element.value tab', async () => {
    const size = 3;
    const value = 1;
    const template = html`<x-tabs size=${size} value=${value}></x-tabs>`;
    const element = await fixture<Tabs>(template);

    await testLayout(element, size, value);
  });

  it('navigates between tabs using mouse', async () => {
    const element = await fixture<Tabs>(html`
      <x-tabs size="3">
        <span slot="tab-0">Tab 1</span>
        <span slot="tab-1">Tab 2</span>
        <span slot="tab-2">Tab 3</span>
      </x-tabs>
    `);

    await testLayout(element, 3, 0);

    const tab1 = element.querySelector('[slot="tab-1"]') as HTMLSlotElement;
    tab1.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await element.updateComplete;
    await testLayout(element, 3, 1);
  });

  it('navigates between tabs using keyboard', async () => {
    const element = await fixture<Tabs>(html`
      <x-tabs size="3">
        <span slot="tab-0">Tab 1</span>
        <span slot="tab-1">Tab 2</span>
        <span slot="tab-2">Tab 3</span>
      </x-tabs>
    `);

    await testLayout(element, 3, 0);

    const tab0 = element.querySelector('[slot="tab-0"]') as HTMLSlotElement;
    tab0.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await element.updateComplete;
    await testLayout(element, 3, 1);

    const tab1 = element.querySelector('[slot="tab-1"]') as HTMLSlotElement;
    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await element.updateComplete;
    await testLayout(element, 3, 2);

    const tab2 = element.querySelector('[slot="tab-2"]') as HTMLSlotElement;
    tab2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

    await element.updateComplete;
    await testLayout(element, 3, 1);

    tab1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

    await element.updateComplete;
    await testLayout(element, 3, 0);
  });
});
