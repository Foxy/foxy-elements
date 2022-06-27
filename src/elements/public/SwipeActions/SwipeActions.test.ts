import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { expect, fixture } from '@open-wc/testing';
import { html, LitElement } from 'lit-element';
import { SwipeActions } from './index';

describe('SwipeActions', () => {
  it('imports and registers itself as foxy-swipe-actions', () => {
    expect(customElements.get('foxy-swipe-actions')).to.equal(SwipeActions);
  });

  it('extends LitElement', () => {
    expect(new SwipeActions()).to.be.instanceOf(LitElement);
  });

  it('renders a default slot', async () => {
    const element = await fixture<SwipeActions>(html`<foxy-swipe-actions></foxy-swipe-actions>`);
    expect(element.renderRoot.querySelector('slot:not([name])')).to.exist;
  });

  it('renders a slot for a swipe action', async () => {
    const element = await fixture<SwipeActions>(html`<foxy-swipe-actions></foxy-swipe-actions>`);
    expect(element.renderRoot.querySelector('slot[name="action"]')).to.exist;
  });

  it('hides swipe action by default', async () => {
    const element = await fixture<SwipeActions>(html`
      <foxy-swipe-actions>
        <div>Content</div>
        <div slot="action">Action</div>
      </foxy-swipe-actions>
    `);

    const action = element.lastElementChild!;
    const elementBox = element.getBoundingClientRect();
    const actionBox = action.getBoundingClientRect();

    expect(actionBox.x).to.be.greaterThanOrEqual(elementBox.x + elementBox.width);
  });

  it('displays swipe action when scrolled into view', async () => {
    const element = await fixture<SwipeActions>(html`
      <foxy-swipe-actions>
        <div>Content</div>
        <div slot="action">Action</div>
      </foxy-swipe-actions>
    `);

    const content = element.firstElementChild!;
    const action = element.lastElementChild!;

    action.scrollIntoView();

    const elementBox = element.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    const actionBox = action.getBoundingClientRect();

    expect(contentBox.x).to.be.lessThan(elementBox.x);
    expect(actionBox.x).to.be.lessThan(elementBox.x + elementBox.width);
  });

  it('toggles swipe action when hovered on', async () => {
    const element = await fixture<SwipeActions>(html`
      <foxy-swipe-actions>
        <div>Content</div>
        <div slot="action">Action</div>
      </foxy-swipe-actions>
    `);

    const content = element.firstElementChild!;
    const action = element.lastElementChild!;
    const elementBox = element.getBoundingClientRect();

    await sendMouse({ type: 'move', position: [elementBox.right - 5, elementBox.top + 5] });
    await new Promise(r => setTimeout(r, 1000));

    let contentBox = content.getBoundingClientRect();
    let actionBox = action.getBoundingClientRect();

    expect(contentBox.x).to.be.lessThan(elementBox.x);
    expect(actionBox.x).to.be.lessThan(elementBox.x + elementBox.width);

    await resetMouse();
    await new Promise(r => setTimeout(r, 1000));

    contentBox = content.getBoundingClientRect();
    actionBox = action.getBoundingClientRect();

    expect(contentBox.x).to.equal(elementBox.x);
    expect(actionBox.x).to.be.greaterThanOrEqual(elementBox.x + elementBox.width);
  });
});
