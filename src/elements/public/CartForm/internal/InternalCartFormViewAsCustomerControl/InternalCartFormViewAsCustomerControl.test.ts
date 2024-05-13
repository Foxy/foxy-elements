import type { FetchEvent } from '../../../NucleonElement/FetchEvent';
import type { CartForm } from '../../CartForm';

import '../../index';
import './index';

import { InternalCartFormViewAsCustomerControl as Control } from './InternalCartFormViewAsCustomerControl';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { createRouter } from '../../../../../server/index';
import { getByKey } from '../../../../../testgen/getByKey';
import { getByTag } from '../../../../../testgen/getByTag';
import { I18n } from '../../../I18n/I18n';

describe('CartForm', () => {
  describe('InternalCartFormViewAsCustomerControl', () => {
    const OriginalResizeObserver = window.ResizeObserver;

    // @ts-expect-error disabling ResizeObserver because it errors in test env
    before(() => (window.ResizeObserver = undefined));
    after(() => (window.ResizeObserver = OriginalResizeObserver));

    it('imports and defines foxy-internal-control', () => {
      const element = customElements.get('foxy-internal-control');
      expect(element).to.equal(InternalControl);
    });

    it('imports and defines foxy-i18n', () => {
      const element = customElements.get('foxy-i18n');
      expect(element).to.equal(I18n);
    });

    it('imports and defines itself as foxy-internal-cart-form-view-as-customer-control', () => {
      const element = customElements.get('foxy-internal-cart-form-view-as-customer-control');
      expect(element).to.equal(Control);
    });

    it('extends InternalControl', () => {
      expect(new Control()).to.be.instanceOf(InternalControl);
    });

    it('renders loading indicator by default', async () => {
      const form = await fixture(html`
        <foxy-cart-form @fetch=${(evt: FetchEvent) => evt.respondWith(new Promise(() => void 0))}>
          <foxy-internal-cart-form-view-as-customer-control infer="view-as-customer">
          </foxy-internal-cart-form-view-as-customer-control>
        </foxy-cart-form>
      `);

      const control = form.firstElementChild as Control;
      const label = await getByKey(control, 'state_busy');

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
    });

    it('renders error state indicator if session creation fails', async () => {
      const router = createRouter();
      const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
      const failAnyFetch = (evt: FetchEvent) => {
        evt.respondWith(Promise.resolve(new Response(null, { status: 500 })));
      };

      const form = await fixture<CartForm>(html`<foxy-cart-form></foxy-cart-form>`);
      form.addEventListener('fetch', handleFetch as (evt: Event) => unknown);
      form.href = 'https://demo.api/hapi/carts/0';

      await waitUntil(() => !!form.data, '', { timeout: 5000 });

      form.removeEventListener('fetch', handleFetch as (evt: Event) => unknown);
      form.addEventListener('fetch', failAnyFetch as (evt: Event) => unknown);
      form.innerHTML = `
        <foxy-internal-cart-form-view-as-customer-control infer="view-as-customer"></foxy-internal-cart-form-view-as-customer-control>
      `;

      const control = form.firstElementChild as Control;

      await waitUntil(
        async () => {
          await control.requestUpdate();
          return !!control.renderRoot.querySelector('[key="state_fail"]');
        },
        '',
        { timeout: 5000 }
      );

      const label = await getByKey(control, 'state_fail');
      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
    });

    it('renders cart link once session is created successfully', async () => {
      const router = createRouter();

      const form = await fixture<CartForm>(html`
        <foxy-cart-form
          href="https://demo.api/hapi/carts/0"
          @fetch=${(evt: FetchEvent) => {
            if (evt.request.url === 'https://test.api/create_session') {
              const link = { cart_link: 'https://example.com/cart' };
              evt.respondWith(Promise.resolve(new Response(JSON.stringify(link))));
            } else {
              router.handleEvent(evt);
            }
          }}
        >
        </foxy-cart-form>
      `);

      await waitUntil(() => !!form.data, '', { timeout: 5000 });

      form.data!._links['fx:create_session'].href = 'https://test.api/create_session';
      form.data = { ...form.data! };
      form.innerHTML = `
        <foxy-internal-cart-form-view-as-customer-control infer="view-as-customer"></foxy-internal-cart-form-view-as-customer-control>
      `;

      const control = form.firstElementChild as Control;

      await waitUntil(
        async () => {
          await control.requestUpdate();
          return !!control.renderRoot.querySelector('a');
        },
        '',
        { timeout: 5000 }
      );

      const link = (await getByTag(control, 'a')) as HTMLElement;
      const linkLabel = await getByKey(link, 'state_idle');

      expect(link).to.have.attribute('href', 'https://example.com/cart');
      expect(linkLabel).to.have.attribute('infer', '');
    });
  });
});
