import './index';

import { InternalColorPicker, PALETTE, hexToHsb, hsbToHex, parseHex } from './InternalColorPicker';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { InternalControl } from '../InternalControl/InternalControl';

describe('InternalColorPicker', () => {
  const byTestId = <T extends HTMLElement = HTMLElement>(
    element: InternalColorPicker,
    id: string
  ) => element.renderRoot.querySelector<T>(`[data-testid="${id}"]`);

  async function open(value = '') {
    const changes: string[] = [];
    const element = await fixture<InternalColorPicker>(html`
      <foxy-internal-color-picker
        label="Swatch color"
        .value=${value}
        @change=${(evt: Event) => changes.push((evt.currentTarget as InternalColorPicker).value)}
      >
      </foxy-internal-color-picker>
    `);
    byTestId(element, 'trigger')!.click();
    await element.requestUpdate();
    return { element, changes };
  }

  it('defines itself as foxy-internal-color-picker, an internal control', () => {
    expect(customElements.get('foxy-internal-color-picker')).to.equal(InternalColorPicker);
    expect(new InternalColorPicker()).to.be.instanceOf(InternalControl);
  });

  it('reads a hex color with or without #, in 3 or 6 digits and any case', () => {
    expect(parseHex('#1D1D1F')).to.equal('#1d1d1f');
    expect(parseHex('1d1d1f')).to.equal('#1d1d1f');
    expect(parseHex('  #F80 ')).to.equal('#ff8800');
    expect(parseHex('f80')).to.equal('#ff8800');
    expect(parseHex('#1d1d1')).to.be.null;
    expect(parseHex('teal')).to.be.null;
    expect(parseHex('')).to.be.null;
  });

  it('converts between hex and hue, saturation and brightness', () => {
    expect(hexToHsb('#1f7a8c')).to.deep.equal([190, 78, 55]);
    expect(hexToHsb('#000000')).to.deep.equal([0, 0, 0]);
    expect(hexToHsb('#ffffff')).to.deep.equal([0, 0, 100]);
    expect(hsbToHex([0, 100, 100])).to.equal('#ff0000');
    expect(hsbToHex([120, 100, 50])).to.equal('#008000');
    expect(hsbToHex([215, 40, 0])).to.equal('#000000');
  });

  it('offers a palette of grays and of hues from light to dark, each a different color', () => {
    expect(PALETTE).to.have.length(12 * 8);
    expect(new Set(PALETTE.map(entry => entry.color)).size).to.equal(PALETTE.length);
    expect(PALETTE[0]).to.deep.equal({ color: '#ffffff', hue: 'gray' });
    expect(PALETTE[11]).to.deep.equal({ color: '#000000', hue: 'gray' });
    for (const entry of PALETTE) expect(entry.color).to.match(/^#[0-9a-f]{6}$/);

    const brightness = (row: number) => hexToHsb(PALETTE[row * 12 + 8].color)[2];
    expect(brightness(1), 'a column gets darker down the rows').to.be.greaterThan(brightness(7));
  });

  it('shows the color and its hex on a button that opens the panel', async () => {
    const element = await fixture<InternalColorPicker>(html`
      <foxy-internal-color-picker label="Swatch color" value="#1f7a8c"></foxy-internal-color-picker>
    `);
    const trigger = byTestId(element, 'trigger')!;
    expect(trigger).to.have.attribute('aria-label', 'Swatch color: #1f7a8c');
    expect(trigger).to.have.attribute('aria-expanded', 'false');
    expect(trigger).to.include.text('#1f7a8c');
    expect(byTestId(element, 'panel')).to.not.exist;

    trigger.click();
    await element.requestUpdate();
    expect(trigger).to.have.attribute('aria-expanded', 'true');
    const panel = byTestId(element, 'panel')!;
    expect(panel).to.have.attribute('role', 'dialog');
    expect(panel).to.have.attribute('aria-label', 'Swatch color');
    expect(byTestId<HTMLInputElement>(element, 'hex')!.value).to.equal('#1f7a8c');
    expect(byTestId<HTMLInputElement>(element, 'hue')!.value).to.equal('190');
    expect(byTestId<HTMLInputElement>(element, 'saturation')!.value).to.equal('78');
    expect(byTestId<HTMLInputElement>(element, 'brightness')!.value).to.equal('55');
  });

  it('says there is no color when it has none', async () => {
    const element = await fixture<InternalColorPicker>(html`
      <foxy-internal-color-picker label="Swatch color"></foxy-internal-color-picker>
    `);
    expect(byTestId(element, 'trigger')).to.have.attribute('aria-label', 'Swatch color: none');
  });

  it('picks a color from the palette', async () => {
    const { element, changes } = await open();
    const buttons = Array.from(
      element.renderRoot.querySelectorAll<HTMLButtonElement>('[data-testid="palette"] button')
    );
    expect(buttons).to.have.length(PALETTE.length);
    expect(buttons[20]).to.have.attribute('aria-label', `hue_blue ${PALETTE[20].color}`);

    buttons[20].click();
    await element.requestUpdate();
    expect(element.value).to.equal(PALETTE[20].color);
    expect(changes).to.deep.equal([PALETTE[20].color]);
    expect(buttons[20]).to.have.attribute('aria-pressed', 'true');
    expect(byTestId<HTMLInputElement>(element, 'hex')!.value).to.equal(PALETTE[20].color);
  });

  it('moves through the palette with the arrow keys, one tab stop for all of it', async () => {
    const { element } = await open();
    const buttons = Array.from(
      element.renderRoot.querySelectorAll<HTMLButtonElement>('[data-testid="palette"] button')
    );
    const focused = () =>
      buttons.indexOf((element.renderRoot as ShadowRoot).activeElement as HTMLButtonElement);
    const press = (key: string) =>
      buttons[focused()].dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      );

    expect(focused(), 'focus moves in when the panel opens').to.equal(0);
    expect(buttons.filter(button => button.tabIndex === 0)).to.have.length(1);

    press('ArrowRight');
    expect(focused()).to.equal(1);
    press('ArrowDown');
    expect(focused()).to.equal(13);
    press('End');
    expect(focused()).to.equal(23);
    press('Home');
    expect(focused()).to.equal(12);
    press('ArrowUp');
    expect(focused()).to.equal(0);
    press('ArrowUp');
    expect(focused(), 'stays at the edge').to.equal(0);
    expect(buttons.filter(button => button.tabIndex === 0)).to.have.length(1);
  });

  it('sets hue, saturation and brightness with sliders, keeping the hue of a gray', async () => {
    const { element, changes } = await open('#1f7a8c');
    const slide = async (id: string, value: string) => {
      const slider = byTestId<HTMLInputElement>(element, id)!;
      slider.value = value;
      slider.dispatchEvent(new Event('input'));
      await element.requestUpdate();
    };

    await slide('hue', '300');
    expect(element.value).to.equal(hsbToHex([300, 78, 55]));
    await slide('saturation', '0');
    expect(element.value).to.equal('#8c8c8c');
    expect(byTestId<HTMLInputElement>(element, 'hue')!.value, 'the hue is kept').to.equal('300');
    await slide('brightness', '100');
    await slide('saturation', '100');
    expect(element.value).to.equal('#ff00ff');
    expect(changes).to.have.length(4);
  });

  it('takes a hex value typed or pasted with or without #', async () => {
    const { element, changes } = await open('#1f7a8c');
    const hex = byTestId<HTMLInputElement>(element, 'hex')!;
    const type = async (text: string) => {
      hex.value = text;
      hex.dispatchEvent(new Event('input'));
      await element.requestUpdate();
    };

    await type('6B1F2E');
    expect(element.value).to.equal('#6b1f2e');
    expect(hex.value, 'left as typed').to.equal('6B1F2E');
    expect(hex).to.have.attribute('aria-invalid', 'false');

    await type('#6b1f2');
    expect(element.value, 'not a color yet').to.equal('#6b1f2e');
    expect(hex).to.have.attribute('aria-invalid', 'true');

    hex.dispatchEvent(new Event('change'));
    await element.requestUpdate();
    expect(hex.value, 'goes back to the color on leaving').to.equal('#6b1f2e');

    await type(' #fa0 ');
    expect(element.value).to.equal('#ffaa00');
    expect(changes).to.deep.equal(['#6b1f2e', '#ffaa00']);
  });

  it('clears the color', async () => {
    const { element, changes } = await open('#1f7a8c');
    byTestId(element, 'clear')!.click();
    await element.requestUpdate();
    expect(element.value).to.equal('');
    expect(changes).to.deep.equal(['']);
    expect(byTestId<HTMLInputElement>(element, 'hex')!.value).to.equal('');
    expect(byTestId<HTMLButtonElement>(element, 'clear')!.disabled).to.be.true;
  });

  it('follows a value set from outside', async () => {
    const { element, changes } = await open('#1f7a8c');
    element.value = '#f80';
    await element.requestUpdate();
    expect(byTestId<HTMLInputElement>(element, 'hex')!.value).to.equal('#f80');
    expect(byTestId<HTMLInputElement>(element, 'hue')!.value).to.equal('32');
    expect(changes, 'only the merchant changing it is a change').to.have.length(0);
  });

  it('closes on Escape, on Done and on a press outside, giving focus back to its button', async () => {
    const { element } = await open('#1f7a8c');
    const trigger = byTestId(element, 'trigger')!;

    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    let reachedOutside = false;
    element.addEventListener('keydown', () => (reachedOutside = true), { once: true });
    byTestId(element, 'hex')!.dispatchEvent(escape);
    await element.requestUpdate();
    expect(byTestId(element, 'panel')).to.not.exist;
    expect((element.renderRoot as ShadowRoot).activeElement).to.equal(trigger);
    expect(reachedOutside, 'a dialog around it stays open').to.be.false;

    trigger.click();
    await element.requestUpdate();
    byTestId(element, 'done')!.click();
    await element.requestUpdate();
    expect(byTestId(element, 'panel')).to.not.exist;
    expect((element.renderRoot as ShadowRoot).activeElement).to.equal(trigger);

    trigger.click();
    await element.requestUpdate();
    byTestId(element, 'panel')!.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true })
    );
    await element.requestUpdate();
    expect(byTestId(element, 'panel'), 'a press inside keeps it open').to.exist;
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await element.requestUpdate();
    expect(byTestId(element, 'panel')).to.not.exist;
  });

  it('opens nothing while disabled or read-only', async () => {
    const element = await fixture<InternalColorPicker>(html`
      <foxy-internal-color-picker label="Swatch color" value="#1f7a8c" disabled>
      </foxy-internal-color-picker>
    `);
    expect(byTestId<HTMLButtonElement>(element, 'trigger')!.disabled).to.be.true;

    element.disabled = false;
    element.readonly = true;
    await element.requestUpdate();
    expect(byTestId<HTMLButtonElement>(element, 'trigger')!.disabled).to.be.true;
  });

  it('fires change after its value is set', async () => {
    const { element } = await open();
    const whenChanged = oneEvent(element, 'change');
    element.renderRoot.querySelector<HTMLButtonElement>('[data-testid="palette"] button')!.click();
    await whenChanged;
    expect(element.value).to.equal('#ffffff');
  });
});
