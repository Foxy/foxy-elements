import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-number-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import './composed-vaadin-input';

import { expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';

type Field = HTMLElement & { value: string; inputElement: HTMLInputElement | HTMLTextAreaElement };

const cases = [
  { tag: 'vaadin-text-field', value: 'Acme Store API' },
  { tag: 'vaadin-password-field', value: 'Kq7v2Rm9xTz4Lp3W' },
  { tag: 'vaadin-email-field', value: 'jane.doe@example.com' },
  { tag: 'vaadin-number-field', value: '12.34' },
  { tag: 'vaadin-integer-field', value: '42' },
  { tag: 'vaadin-text-area', value: 'Leave at the side door' },
];

describe('composed-vaadin-input', () => {
  for (const { tag, value } of cases) {
    describe(tag, () => {
      const render = async () => {
        const field = await fixture<Field>(`<${tag}></${tag}>`);
        const events: Event[] = [];
        field.addEventListener('input', evt => events.push(evt));
        return { field, events, input: field.inputElement };
      };

      it('re-dispatches a script-made input event from the field', async () => {
        const { field, events, input } = await render();

        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(events).to.have.length(1);
        expect(events[0].target).to.equal(field);
        expect(events[0].composed).to.be.true;
        expect(field.value).to.equal(value);
      });

      it('does not re-dispatch a composed input event', async () => {
        const { events, input } = await render();

        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

        expect(events).to.have.length(1);
      });
    });
  }

  it('fires one input event per keystroke when typing', async () => {
    const field = await fixture<Field>(html`<vaadin-password-field></vaadin-password-field>`);
    const events: Event[] = [];
    field.addEventListener('input', evt => events.push(evt));

    field.inputElement.focus();
    await sendKeys({ type: 'Kq7' });

    expect(events).to.have.length(3);
    expect(field.value).to.equal('Kq7');
  });
});
