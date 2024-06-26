import './index';

import { expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { PaymentCardEmbed } from './PaymentCardEmbed';
import { PaymentCardEmbed as SDKPaymentCardEmbed } from '@foxy.io/sdk/customer';
import { LitElement } from 'lit-element';
import { I18n } from '../I18n/I18n';
import { stub } from 'sinon';

class TestElement extends PaymentCardEmbed {
  static readonly PaymentCardEmbed = class extends SDKPaymentCardEmbed {
    configure = stub();

    mount = stub().resolves();
  };

  get embed() {
    // @ts-expect-error this is a private member but we really really do need it for testing
    return this.__embed;
  }
}

customElements.define('test-element', TestElement);

describe('PaymentCardEmbed', () => {
  it('imports and defines foxy-spinner element', () => {
    expect(customElements.get('foxy-spinner')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('defines itself as foxy-payment-card-embed element', () => {
    expect(customElements.get('foxy-payment-card-embed')).to.equal(PaymentCardEmbed);
  });

  it('exposes PaymentCardEmbed class as a static property', () => {
    expect(PaymentCardEmbed.PaymentCardEmbed).to.equal(SDKPaymentCardEmbed);
  });

  it('has a default i18next namespace "payment-card-embed"', () => {
    expect(PaymentCardEmbed).to.have.property('defaultNS', 'payment-card-embed');
    expect(new PaymentCardEmbed()).to.have.property('ns', 'payment-card-embed');
  });

  it('extends LitElement', () => {
    expect(new PaymentCardEmbed()).to.be.instanceOf(LitElement);
  });

  it('has a reactive property "url" that defaults to null', () => {
    expect(PaymentCardEmbed).to.have.deep.nested.property('properties.url', {});
    expect(new PaymentCardEmbed()).to.have.property('url', null);
  });

  it('renders a spinner by default', async () => {
    const element = await fixture<TestElement>(html`<test-element></test-element>`);
    const spinner = element.renderRoot.querySelector('foxy-spinner');
    const container = element.renderRoot.querySelector('#iframe-container');

    expect(spinner).to.exist;
    expect(spinner).to.be.visible;
    expect(spinner).to.have.attribute('infer', 'spinner');
    expect(spinner).to.have.attribute('layout', 'no-label');
    expect(spinner?.parentElement).to.not.have.class('opacity-0');

    expect(container).to.have.class('opacity-0');
  });

  it('mounts PaymentCardEmbed instance when configured with url', async () => {
    const element = await fixture<TestElement>(html`<test-element></test-element>`);
    const container = element.renderRoot.querySelector('#iframe-container');
    expect(element.embed).to.not.exist;

    element.url = 'https://embed.foxy.io/v1.html?demo=default';
    await element.requestUpdate('url');
    await waitUntil(() => !!element.embed);
    expect(element.embed?.mount).to.have.been.calledOnceWithExactly(container);
  });

  it('hides the spinner when embed is ready', async () => {
    const element = await fixture<TestElement>(
      html`<test-element url="https://embed.foxy.io/v1.html?demo=default"></test-element>`
    );

    const spinner = element.renderRoot.querySelector('foxy-spinner');
    const container = element.renderRoot.querySelector('#iframe-container');

    await waitUntil(() => {
      element.requestUpdate('url');
      return !!spinner?.parentElement?.classList.contains('opacity-0');
    });

    expect(spinner?.parentElement).to.have.class('opacity-0');
    expect(container).to.not.have.class('opacity-0');
  });

  it('configures the embed with defaults', async () => {
    const element = await fixture<TestElement>(
      html`<test-element url="https://embed.foxy.io/v1.html?demo=default"></test-element>`
    );

    await waitUntil(() => element.requestUpdate('url') && !!element.embed);
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(element.embed?.configure).to.have.been.calledWithMatch({
      translations: {
        stripe: {
          label: 'stripe.label',
          status: {
            idle: 'stripe.status.idle',
            busy: 'stripe.status.busy',
            fail: 'stripe.status.fail',
          },
        },
        square: {
          label: 'square.label',
          status: {
            idle: 'square.status.idle',
            busy: 'square.status.busy',
            fail: 'square.status.fail',
          },
        },
        default: {
          'cc-number': {
            label: 'default.cc-number.label',
            placeholder: 'default.cc-number.placeholder',
            v8n_required: 'default.cc-number.v8n_required',
            v8n_invalid: 'default.cc-number.v8n_invalid',
            v8n_unsupported: 'default.cc-number.v8n_unsupported',
          },
          'cc-exp': {
            label: 'default.cc-exp.label',
            placeholder: 'default.cc-exp.placeholder',
            v8n_required: 'default.cc-exp.v8n_required',
            v8n_invalid: 'default.cc-exp.v8n_invalid',
            v8n_expired: 'default.cc-exp.v8n_expired',
          },
          'cc-csc': {
            label: 'default.cc-csc.label',
            placeholder: 'default.cc-csc.placeholder',
            v8n_required: 'default.cc-csc.v8n_required',
            v8n_invalid: 'default.cc-csc.v8n_invalid',
          },
          'status': {
            idle: 'default.status.idle',
            busy: 'default.status.busy',
            fail: 'default.status.fail',
            misconfigured: 'default.status.misconfigured',
          },
        },
      },
      disabled: false,
      readonly: false,
      style: {
        '--lumo-space-m': '16px',
        '--lumo-space-s': '8px',
        '--lumo-contrast-5pct': 'rgba(25, 59, 103, 0.05)',
        '--lumo-contrast-10pct': 'rgba(26, 57, 96, 0.1)',
        '--lumo-contrast-50pct': 'rgba(28, 48, 74, 0.5)',
        '--lumo-size-m': '36px',
        '--lumo-size-xs': '26px',
        '--lumo-border-radius-m': '4px',
        '--lumo-border-radius-s': '4px',
        '--lumo-font-family':
          '-apple-system, "system-ui", Roboto, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        '--lumo-font-size-m': '16px',
        '--lumo-font-size-s': '14px',
        '--lumo-font-size-xs': '13px',
        '--lumo-primary-color': 'rgb(22, 118, 243)',
        '--lumo-primary-text-color': 'rgb(22, 118, 243)',
        '--lumo-primary-color-50pct': 'rgba(22, 118, 243, 0.5)',
        '--lumo-secondary-text-color': 'rgba(27, 43, 65, 0.72)',
        '--lumo-disabled-text-color': 'rgba(28, 52, 84, 0.26)',
        '--lumo-body-text-color': 'rgba(24, 39, 57, 0.94)',
        '--lumo-error-text-color': 'rgb(245, 36, 25)',
        '--lumo-error-color-10pct': 'rgba(255, 61, 51, 0.1)',
        '--lumo-error-color-50pct': 'rgba(255, 61, 51, 0.5)',
        '--lumo-line-height-xs': '20px',
        '--lumo-base-color': 'rgb(255, 255, 255)',
      },
      lang: '',
    });
  });

  it('configures the embed with custom options from environment', async () => {
    const element = await fixture<TestElement>(
      html`
        <test-element
          style="--lumo-space-m:20px;--lumo-space-s:10px;--lumo-contrast-5pct:rgba(0, 0, 0, 0.05);--lumo-contrast-10pct:rgba(0, 0, 0, 0.1);--lumo-contrast-50pct:rgba(0, 0, 0, 0.5);--lumo-size-m:50px;--lumo-size-xs:25px;--lumo-border-radius:10px;--lumo-border-radius-s:7.5px;--lumo-font-family:serif;--lumo-font-size-m:18px;--lumo-font-size-s:16px;--lumo-font-size-xs:14px;--lumo-primary-color:rgba(0, 0, 255, 1);--lumo-primary-text-color:rgba(0, 0, 255, 1);--lumo-primary-color-50pct:rgba(0, 0, 255, 0.5);--lumo-secondary-text-color:rgba(0, 0, 0, 0.8);--lumo-disabled-text-color:rgba(0, 0, 0, 0.5);--lumo-body-text-color:rgba(0, 0, 0, 1);--lumo-error-text-color:rgba(255, 0, 0, 1);--lumo-error-color-10pct:rgba(255, 0, 0, 0.1);--lumo-error-color-50pct:rgba(255, 0, 0, 0.5);--lumo-line-height-xs:18px;--lumo-base-color:rgba(220, 220, 220, 1);"
          lang="es"
          url="https://embed.foxy.io/v1.html?demo=default"
          ns="my-test-element"
          disabled
          readonly
        >
        </test-element>
      `
    );

    const translations = {
      stripe: {
        label: 'Detalles de tarjeta',
        status: {
          idle: 'Stripe procesa de forma segura los datos de tu tarjeta. ',
          busy: 'Cifrando los datos de tu tarjeta...',
          fail: 'Este servicio no está disponible actualmente. ',
        },
      },
      square: {
        label: 'Detalles de tarjeta',
        status: {
          idle: 'Square procesa de forma segura los datos de su tarjeta. ',
          busy: 'Cifrando los datos de tu tarjeta...',
          fail: 'Este servicio no está disponible actualmente. ',
        },
      },
      default: {
        'cc-number': {
          label: 'Número de tarjeta',
          placeholder: '1234 1234 1234 1234',
          v8n_required: 'Ingrese un número de tarjeta.',
          v8n_invalid: 'Verifique el número de su tarjeta; no parece ser válido.',
          v8n_unsupported: 'No admitimos este tipo de tarjeta.',
        },
        'cc-exp': {
          label: 'Expira el',
          placeholder: 'MM/AAAA',
          v8n_required: 'Introduzca una fecha de vencimiento.',
          v8n_invalid: 'Introduzca una fecha como MM/AAAA.',
          v8n_expired: 'Tu tarjeta ha caducado.',
        },
        'cc-csc': {
          label: 'CSC',
          placeholder: 'XXX',
          v8n_required: 'Ingrese un código de seguridad.',
          v8n_invalid: 'Ingrese un código de 3 a 4 dígitos.',
        },
        'status': {
          idle: 'Foxy.io procesa de forma segura los datos de su tarjeta. ',
          busy: 'Cifrando los datos de tu tarjeta...',
          fail: 'Este servicio no está disponible actualmente. ',
          misconfigured: 'Este formulario no está configurado correctamente. ',
        },
      },
    };

    I18n.i18next.addResourceBundle('es', 'my-test-element', translations);

    await waitUntil(() => element.requestUpdate('url') && !!element.embed);
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(element.embed?.configure).to.have.been.calledWithMatch({
      translations,
      disabled: true,
      readonly: true,
      style: {
        '--lumo-space-m': '20px',
        '--lumo-space-s': '10px',
        '--lumo-contrast-5pct': 'rgba(0, 0, 0, 0.05)',
        '--lumo-contrast-10pct': 'rgba(0, 0, 0, 0.1)',
        '--lumo-contrast-50pct': 'rgba(0, 0, 0, 0.5)',
        '--lumo-size-m': '50px',
        '--lumo-size-xs': '25px',
        '--lumo-border-radius-m': '10px',
        '--lumo-border-radius-s': '7.5px',
        '--lumo-font-family': 'serif',
        '--lumo-font-size-m': '18px',
        '--lumo-font-size-s': '16px',
        '--lumo-font-size-xs': '14px',
        '--lumo-primary-color': 'rgb(0, 0, 255)',
        '--lumo-primary-text-color': 'rgb(0, 0, 255)',
        '--lumo-primary-color-50pct': 'rgba(0, 0, 255, 0.5)',
        '--lumo-secondary-text-color': 'rgba(0, 0, 0, 0.8)',
        '--lumo-disabled-text-color': 'rgba(0, 0, 0, 0.5)',
        '--lumo-body-text-color': 'rgb(0, 0, 0)',
        '--lumo-error-text-color': 'rgb(255, 0, 0)',
        '--lumo-error-color-10pct': 'rgba(255, 0, 0, 0.1)',
        '--lumo-error-color-50pct': 'rgba(255, 0, 0, 0.5)',
        '--lumo-line-height-xs': '18px',
        '--lumo-base-color': 'rgb(220, 220, 220)',
      },
      lang: 'es',
    });
  });

  it('returns the result of PaymentCardEmded.tokenize() when calling tokenize()', async () => {
    const element = await fixture<TestElement>(
      html`<test-element url="https://embed.foxy.io/v1.html?demo=default"></test-element>`
    );

    await waitUntil(() => element.requestUpdate('url') && !!element.embed);
    const randomToken = Math.random().toString(36).slice(2);
    const tokenizeStub = stub(element.embed!, 'tokenize').resolves(randomToken);

    expect(await element.tokenize()).to.equal(randomToken);
    expect(tokenizeStub).to.have.been.calledOnce;
  });

  it('calls PaymentCardEmbed.clear() when calling clear()', async () => {
    const element = await fixture<TestElement>(
      html`<test-element url="https://embed.foxy.io/v1.html?demo=default"></test-element>`
    );

    await waitUntil(() => element.requestUpdate('url') && !!element.embed);
    const clearStub = stub(element.embed!, 'clear');

    element.clear();
    expect(clearStub).to.have.been.calledOnce;
  });

  it('dispatches "submit" event upon receiving "submit" event from iframe', async () => {
    const element = await fixture<TestElement>(
      html`<test-element url="https://embed.foxy.io/v1.html?demo=default"></test-element>`
    );

    await waitUntil(() => element.requestUpdate('url') && !!element.embed);
    const submitEventPromise = oneEvent(element, 'submit');

    element.embed?.onsubmit?.();
    expect(await submitEventPromise).to.be.instanceOf(CustomEvent);
  });
});
