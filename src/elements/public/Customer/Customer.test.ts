import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { AddressCard } from '../AddressCard';
import { AttributeCard } from '../AttributeCard/AttributeCard';
import { CollectionPage } from '../CollectionPage';
import { CollectionPages } from '../CollectionPages';
import { Core } from '@foxy.io/sdk';
import { Customer } from './index';
import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormDialog } from '../FormDialog/FormDialog';
import { InternalSandbox } from '../../internal/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PaymentMethodCard } from '../PaymentMethodCard';
import { Rels } from '@foxy.io/sdk/backend';
import { SubscriptionsTable } from '../SubscriptionsTable/SubscriptionsTable';
import { Table } from '../Table';
import { getByKey } from '../../../testgen/getByKey';
import { getByName } from '../../../testgen/getByName';
import { getByTestClass } from '../../../testgen/getByTestClass';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { router } from '../../../server';
import { stub } from 'sinon';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('Customer', () => {
  it('extends NucleonElement', () => {
    expect(new Customer()).to.be.instanceOf(NucleonElement);
  });

  it('registers as foxy-customer', () => {
    expect(customElements.get('foxy-customer')).to.equal(Customer);
  });

  describe('header', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'header')).to.exist;
    });

    it('is hidden when element is hidden', async () => {
      const layout = html`<foxy-customer hidden></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'header')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "header"', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer hiddencontrols="header"></foxy-customer>
      `);

      expect(await getByTestId(element, 'header')).not.to.exist;
    });

    it('renders "header:before" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'header:before')).to.have.property('localName', 'slot');
    });

    it('replaces "header:before" slot with template "header:before" if available', async () => {
      const name = 'header:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "header:after" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'header:after')).to.have.property('localName', 'slot');
    });

    it('replaces "header:after" slot with template "header:after" if available', async () => {
      const name = 'header:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('once loaded, renders full name in header', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');

      data.first_name = 'Justice';
      data.last_name = 'Witt';

      const layout = html`<foxy-customer .data=${data}></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const header = await getByTestId(element, 'header');

      expect(header).to.contain.text('Justice Witt');
    });

    describe('actions', () => {
      it('is visible by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'header:actions')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const layout = html`<foxy-customer hidden></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'header:actions')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "header:actions"', async () => {
        const element = await fixture<Customer>(html`
          <foxy-customer hiddencontrols="header:actions"></foxy-customer>
        `);

        expect(await getByTestId(element, 'header:actions')).not.to.exist;
      });

      it('is rendered with "header:actions:before" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'header:actions:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "header:actions:before" template if available', async () => {
        const name = 'header:actions:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is rendered with "header:actions:after" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'header:actions:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "header:actions:after" template if available', async () => {
        const name = 'header:actions:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      describe('edit', () => {
        it('is visible by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          expect(await getByTestId(element, 'header:actions:edit')).to.exist;
        });

        it('is hidden when element is hidden', async () => {
          const layout = html`<foxy-customer hidden></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          expect(await getByTestId(element, 'header:actions:edit')).not.to.exist;
        });

        it('is hidden when hiddencontrols includes "header:actions:edit"', async () => {
          const element = await fixture<Customer>(html`
            <foxy-customer hiddencontrols="header:actions:edit"></foxy-customer>
          `);

          expect(await getByTestId(element, 'header:actions:edit')).not.to.exist;
        });

        it('is rendered with "header:actions:edit:before" slot by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const slot = await getByName(element, 'header:actions:edit:before');

          expect(slot).to.have.property('localName', 'slot');
        });

        it('is rendered with "header:actions:edit:before" template if available', async () => {
          const name = 'header:actions:edit:before';
          const value = `<p>Value of the "${name}" template.</p>`;
          const element = await fixture<Customer>(html`
            <foxy-customer>
              <template slot=${name}>${unsafeHTML(value)}</template>
            </foxy-customer>
          `);

          const slot = await getByName<HTMLSlotElement>(element, name);
          const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

          expect(slot).to.not.exist;
          expect(sandbox).to.contain.html(value);
        });

        it('is rendered with "header:actions:edit:after" slot by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const slot = await getByName(element, 'header:actions:edit:after');

          expect(slot).to.have.property('localName', 'slot');
        });

        it('is rendered with "header:actions:edit:after" template if available', async () => {
          const name = 'header:actions:edit:after';
          const value = `<p>Value of the "${name}" template.</p>`;
          const element = await fixture<Customer>(html`
            <foxy-customer>
              <template slot=${name}>${unsafeHTML(value)}</template>
            </foxy-customer>
          `);

          const slot = await getByName<HTMLSlotElement>(element, name);
          const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

          expect(slot).to.not.exist;
          expect(sandbox).to.contain.html(value);
        });

        it('is disabled by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'header:actions:edit');

          expect(control).to.have.attribute('disabled');
        });

        it('is enabled once loaded', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const layout = html`<foxy-customer .data=${data}></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'header:actions:edit');

          expect(control).not.to.have.attribute('disabled');
        });

        it('once loaded, is disabled if element is disabled', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const layout = html`<foxy-customer .data=${data} disabled></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'header:actions:edit');

          expect(control).to.have.attribute('disabled');
        });

        it('once loaded, is disabled if disabledcontrols includes "header:actions:edit"', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const element = await fixture<Customer>(html`
            <foxy-customer .data=${data} disabledcontrols="header:actions:edit"></foxy-customer>
          `);

          const control = await getByTestId(element, 'header:actions:edit');
          expect(control).to.have.attribute('disabled');
        });

        it('opens customer form dialog on click', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const element = await fixture<Customer>(html`
            <foxy-customer
              readonlycontrols="header:actions:edit:form:not=foo,bar"
              disabledcontrols="header:actions:edit:form:baz"
              hiddencontrols="header:actions:edit:form:qux"
              parent="/customers"
              group="foo"
              lang="es"
              .data=${data}
            >
              <template slot="header:actions:edit:form:items:before">Test</template>
            </foxy-customer>
          `);

          const button = await getByTestId(element, 'header:actions:edit');
          const form = await getByTestId<FormDialog>(element, 'header:actions:edit:form');
          const showMethod = stub(form!, 'show');

          button!.dispatchEvent(new CustomEvent('click'));

          expect(form!).to.have.attribute('readonlycontrols', 'not=foo,bar');
          expect(form!).to.have.attribute('disabledcontrols', 'baz:not=*');
          expect(form!).to.have.attribute('hiddencontrols', 'qux:not=*');
          expect(form!).to.have.attribute('header', 'update');
          expect(form!).to.have.attribute('parent', '/customers');
          expect(form!).to.have.attribute('group', 'foo');
          expect(form!).to.have.attribute('lang', 'es');
          expect(form!).to.have.attribute('href', data._links.self.href);
          expect(form!).to.have.attribute('form', 'foxy-customer-form');
          expect(form!).to.have.attribute('ns', 'customer');
          expect(form!.templates).to.have.key('items:before');

          expect(showMethod).to.have.been.called;
        });
      });
    });
  });

  describe('addresses', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'addresses')).to.exist;
    });

    it('is hidden when element is hidden', async () => {
      const layout = html`<foxy-customer hidden></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'addresses')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "addresses"', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer hiddencontrols="addresses"></foxy-customer>
      `);

      expect(await getByTestId(element, 'addresses')).not.to.exist;
    });

    it('renders "addresses:before" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'addresses:before')).to.have.property('localName', 'slot');
    });

    it('replaces "addresses:before" slot with template "addresses:before" if available', async () => {
      const name = 'addresses:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "addresses:after" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'addresses:after')).to.have.property('localName', 'slot');
    });

    it('replaces "addresses:after" slot with template "addresses:after" if available', async () => {
      const name = 'addresses:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders section header with i18n key "address_plural"', async () => {
      const layout = html`<foxy-customer lang="es"></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const header = await getByKey(element, 'address_plural');

      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('ns', 'customer');
    });

    describe('actions', () => {
      it('is visible by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'addresses:actions')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const layout = html`<foxy-customer hidden></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'addresses:actions')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "addresses:actions"', async () => {
        const element = await fixture<Customer>(html`
          <foxy-customer hiddencontrols="addresses:actions"></foxy-customer>
        `);

        expect(await getByTestId(element, 'addresses:actions')).not.to.exist;
      });

      it('is rendered with "addresses:actions:before" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'addresses:actions:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "addresses:actions:before" template if available', async () => {
        const name = 'addresses:actions:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is rendered with "addresses:actions:after" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'addresses:actions:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "addresses:actions:after" template if available', async () => {
        const name = 'addresses:actions:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      describe('create', () => {
        it('is visible by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          expect(await getByTestId(element, 'addresses:actions:create')).to.exist;
        });

        it('is hidden when element is hidden', async () => {
          const layout = html`<foxy-customer hidden></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          expect(await getByTestId(element, 'addresses:actions:create')).not.to.exist;
        });

        it('is hidden when hiddencontrols includes "addresses:actions:create"', async () => {
          const element = await fixture<Customer>(html`
            <foxy-customer hiddencontrols="addresses:actions:create"></foxy-customer>
          `);

          expect(await getByTestId(element, 'addresses:actions:create')).not.to.exist;
        });

        it('is rendered with "addresses:actions:create:before" slot by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const slot = await getByName(element, 'addresses:actions:create:before');

          expect(slot).to.have.property('localName', 'slot');
        });

        it('is rendered with "addresses:actions:create:before" template if available', async () => {
          const name = 'addresses:actions:create:before';
          const value = `<p>Value of the "${name}" template.</p>`;
          const element = await fixture<Customer>(html`
            <foxy-customer>
              <template slot=${name}>${unsafeHTML(value)}</template>
            </foxy-customer>
          `);

          const slot = await getByName<HTMLSlotElement>(element, name);
          const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

          expect(slot).to.not.exist;
          expect(sandbox).to.contain.html(value);
        });

        it('is rendered with "addresses:actions:create:after" slot by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const slot = await getByName(element, 'addresses:actions:create:after');

          expect(slot).to.have.property('localName', 'slot');
        });

        it('is rendered with "addresses:actions:create:after" template if available', async () => {
          const name = 'addresses:actions:create:after';
          const value = `<p>Value of the "${name}" template.</p>`;
          const element = await fixture<Customer>(html`
            <foxy-customer>
              <template slot=${name}>${unsafeHTML(value)}</template>
            </foxy-customer>
          `);

          const slot = await getByName<HTMLSlotElement>(element, name);
          const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

          expect(slot).to.not.exist;
          expect(sandbox).to.contain.html(value);
        });

        it('is disabled by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'addresses:actions:create');

          expect(control).to.have.attribute('disabled');
        });

        it('is enabled once loaded', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const layout = html`<foxy-customer .data=${data}></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'addresses:actions:create');

          expect(control).not.to.have.attribute('disabled');
        });

        it('once loaded, is disabled if element is disabled', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const layout = html`<foxy-customer .data=${data} disabled></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'addresses:actions:create');

          expect(control).to.have.attribute('disabled');
        });

        it('once loaded, is disabled if disabledcontrols includes "addresses:actions:create"', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const element = await fixture<Customer>(html`
            <foxy-customer .data=${data} disabledcontrols="addresses:actions:create">
            </foxy-customer>
          `);

          const control = await getByTestId(element, 'addresses:actions:create');
          expect(control).to.have.attribute('disabled');
        });

        it('opens address form dialog on click', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const element = await fixture<Customer>(html`
            <foxy-customer
              readonlycontrols="addresses:actions:create:form:not=foo,bar"
              disabledcontrols="addresses:actions:create:form:baz"
              hiddencontrols="addresses:actions:create:form:qux"
              group="foo"
              lang="es"
              .data=${data}
            >
              <template slot="addresses:actions:create:form:items:before">Test</template>
            </foxy-customer>
          `);

          const button = await getByTestId(element, 'addresses:actions:create');
          const form = await getByTestId<FormDialog>(element, 'addresses:actions:create:form');
          const showMethod = stub(form!, 'show');

          button!.dispatchEvent(new CustomEvent('click'));

          expect(form!).to.have.attribute('readonlycontrols', 'not=foo,bar');
          expect(form!).to.have.attribute('disabledcontrols', 'baz:not=*');
          expect(form!).to.have.attribute('hiddencontrols', 'qux:not=*');
          expect(form!).to.have.attribute('header', 'create');
          expect(form!).to.have.attribute('parent', data._links['fx:customer_addresses'].href);
          expect(form!).to.have.attribute('group', 'foo');
          expect(form!).to.have.attribute('lang', 'es');
          expect(form!).to.have.attribute('form', 'foxy-address-form');
          expect(form!).to.have.attribute('ns', 'customer');
          expect(form!.templates).to.have.key('items:before');

          expect(showMethod).to.have.been.called;
        });
      });
    });

    describe('list', () => {
      describe('card', () => {
        it('renders customer addresses once loaded', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const listHref = data._links['fx:customer_addresses'].href;
          const listData = await getTestData<Core.Resource<Rels.CustomerAddresses>>(listHref);
          const element = await fixture<Customer>(html`
            <foxy-customer
              hiddencontrols="addresses:list:card:company"
              group="foo"
              lang="es"
              .data=${data}
              @fetch=${(evt: FetchEvent) => {
                if (evt.request.url !== listHref) return;
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(listData))));
              }}
            >
              <template slot="addresses:list:card:address-name:before">
                <div>Content</div>
              </template>
            </foxy-customer>
          `);

          const list = await getByTestId<CollectionPages<any>>(element, 'addresses:list');

          await waitUntil(() => {
            const pages = list!.querySelectorAll<CollectionPage<any>>('foxy-collection-page');
            return Array.from(pages).every(page => page.in('idle'));
          });

          const cards = list!.querySelectorAll('[data-testclass="addresses:list:card"]');

          for (let index = 0; index < cards.length; ++index) {
            const wrapper = cards[index];
            const card = wrapper.firstElementChild as AddressCard;
            const page = card.parentElement as CollectionPage<any>;
            const cardData = listData._embedded['fx:customer_addresses'][index];

            expect(card).to.have.attribute('hiddencontrols', 'company:not=*');
            expect(card).to.have.attribute('parent', page.href);
            expect(card).to.have.attribute('group', 'foo');
            expect(card).to.have.attribute('lang', 'es');
            expect(card).to.have.attribute('href', cardData._links.self.href);
            expect(card.templates).to.have.key('address-name:before');
          }
        });

        it('opens edit dialog on click', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const listHref = data._links['fx:customer_addresses'].href;
          const listData = await getTestData<Core.Resource<Rels.CustomerAddresses>>(listHref);
          const handleFetch = (evt: FetchEvent) => {
            if (evt.request.url !== listHref) return;
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(listData))));
          };

          const layout = html`<foxy-customer .data=${data} @fetch=${handleFetch}></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const list = await getByTestId<CollectionPages<any>>(element, 'addresses:list');

          await waitUntil(() => {
            const pages = list!.querySelectorAll<CollectionPage<any>>('foxy-collection-page');
            return Array.from(pages).every(page => page.in('idle'));
          });

          const button = (await getByTestClass(element, 'addresses:list:card'))[0];
          const card = button.firstElementChild as AddressCard;
          const form = await getByTestId<FormDialog>(element, 'addresses:list:form');
          const showMethod = stub(form!, 'show');

          button.click();

          expect(showMethod).to.have.been.called;
          expect(form).to.have.property('parent', listHref);
          expect(form).to.have.property('href', card.href);
        });
      });

      describe('form', () => {
        it('relays element configuration to form', async () => {
          const element = await fixture<Customer>(html`
            <foxy-customer
              readonlycontrols="addresses:list:form:city"
              disabledcontrols="addresses:list:form:region"
              hiddencontrols="addresses:list:form:company"
              group="foo"
              lang="es"
            >
              <template slot="addresses:list:form:address-name:before">
                <div>Content</div>
              </template>
            </foxy-customer>
          `);

          const form = await getByTestId<FormDialog>(element, 'addresses:list:form');

          expect(form).to.have.attribute('readonlycontrols', 'city:not=*');
          expect(form).to.have.attribute('disabledcontrols', 'region:not=*');
          expect(form).to.have.attribute('hiddencontrols', 'company:not=*');
          expect(form).to.have.attribute('group', 'foo');
          expect(form).to.have.attribute('lang', 'es');
          expect(form).to.have.attribute('ns', 'customer');
          expect(form!.templates).to.have.key('address-name:before');
        });

        it('renders i18n key "update" in the header', async () => {
          const element = await fixture<Customer>(html`<foxy-customer></foxy-customer>`);
          const form = await getByTestId(element, 'addresses:list:form');
          expect(form).to.have.attribute('header', 'update');
        });

        it('renders with foxy-address-form', async () => {
          const element = await fixture<Customer>(html`<foxy-customer></foxy-customer>`);
          const form = await getByTestId(element, 'addresses:list:form');
          expect(form).to.have.attribute('form', 'foxy-address-form');
        });
      });

      it('is hidden when element is hidden', async () => {
        const layout = html`<foxy-customer hidden></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'addresses:list')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "addresses:list"', async () => {
        const element = await fixture<Customer>(html`
          <foxy-customer hiddencontrols="addresses:list"></foxy-customer>
        `);

        expect(await getByTestId(element, 'addresses:list')).not.to.exist;
      });

      it('is rendered with "addresses:list:before" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'addresses:list:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "addresses:list:before" template if available', async () => {
        const name = 'addresses:list:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is rendered with "addresses:list:after" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'addresses:list:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "addresses:list:after" template if available', async () => {
        const name = 'addresses:list:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });
    });
  });

  describe('attributes', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'attributes')).to.exist;
    });

    it('is hidden when element is hidden', async () => {
      const layout = html`<foxy-customer hidden></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'attributes')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "attributes"', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer hiddencontrols="attributes"></foxy-customer>
      `);

      expect(await getByTestId(element, 'attributes')).not.to.exist;
    });

    it('renders "attributes:before" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'attributes:before')).to.have.property('localName', 'slot');
    });

    it('replaces "attributes:before" slot with template "attributes:before" if available', async () => {
      const name = 'attributes:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "attributes:after" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'attributes:after')).to.have.property('localName', 'slot');
    });

    it('replaces "attributes:after" slot with template "attributes:after" if available', async () => {
      const name = 'attributes:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders section header with i18n key "attribute_plural"', async () => {
      const layout = html`<foxy-customer lang="es"></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const header = await getByKey(element, 'attribute_plural');

      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('ns', 'customer');
    });

    describe('actions', () => {
      it('is visible by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'attributes:actions')).to.exist;
      });

      it('is hidden when element is hidden', async () => {
        const layout = html`<foxy-customer hidden></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'attributes:actions')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "attributes:actions"', async () => {
        const element = await fixture<Customer>(html`
          <foxy-customer hiddencontrols="attributes:actions"></foxy-customer>
        `);

        expect(await getByTestId(element, 'attributes:actions')).not.to.exist;
      });

      it('is rendered with "attributes:actions:before" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'attributes:actions:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "attributes:actions:before" template if available', async () => {
        const name = 'attributes:actions:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is rendered with "attributes:actions:after" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'attributes:actions:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "attributes:actions:after" template if available', async () => {
        const name = 'attributes:actions:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      describe('create', () => {
        it('is visible by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          expect(await getByTestId(element, 'attributes:actions:create')).to.exist;
        });

        it('is hidden when element is hidden', async () => {
          const layout = html`<foxy-customer hidden></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          expect(await getByTestId(element, 'attributes:actions:create')).not.to.exist;
        });

        it('is hidden when hiddencontrols includes "attributes:actions:create"', async () => {
          const element = await fixture<Customer>(html`
            <foxy-customer hiddencontrols="attributes:actions:create"></foxy-customer>
          `);

          expect(await getByTestId(element, 'attributes:actions:create')).not.to.exist;
        });

        it('is rendered with "attributes:actions:create:before" slot by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const slot = await getByName(element, 'attributes:actions:create:before');

          expect(slot).to.have.property('localName', 'slot');
        });

        it('is rendered with "attributes:actions:create:before" template if available', async () => {
          const name = 'attributes:actions:create:before';
          const value = `<p>Value of the "${name}" template.</p>`;
          const element = await fixture<Customer>(html`
            <foxy-customer>
              <template slot=${name}>${unsafeHTML(value)}</template>
            </foxy-customer>
          `);

          const slot = await getByName<HTMLSlotElement>(element, name);
          const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

          expect(slot).to.not.exist;
          expect(sandbox).to.contain.html(value);
        });

        it('is rendered with "attributes:actions:create:after" slot by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const slot = await getByName(element, 'attributes:actions:create:after');

          expect(slot).to.have.property('localName', 'slot');
        });

        it('is rendered with "attributes:actions:create:after" template if available', async () => {
          const name = 'attributes:actions:create:after';
          const value = `<p>Value of the "${name}" template.</p>`;
          const element = await fixture<Customer>(html`
            <foxy-customer>
              <template slot=${name}>${unsafeHTML(value)}</template>
            </foxy-customer>
          `);

          const slot = await getByName<HTMLSlotElement>(element, name);
          const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

          expect(slot).to.not.exist;
          expect(sandbox).to.contain.html(value);
        });

        it('is disabled by default', async () => {
          const layout = html`<foxy-customer></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'attributes:actions:create');

          expect(control).to.have.attribute('disabled');
        });

        it('is enabled once loaded', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const layout = html`<foxy-customer .data=${data}></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'attributes:actions:create');

          expect(control).not.to.have.attribute('disabled');
        });

        it('once loaded, is disabled if element is disabled', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const layout = html`<foxy-customer .data=${data} disabled></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const control = await getByTestId(element, 'attributes:actions:create');

          expect(control).to.have.attribute('disabled');
        });

        it('once loaded, is disabled if disabledcontrols includes "attributes:actions:create"', async () => {
          const data = await getTestData('./s/admin/customers/0');
          const element = await fixture<Customer>(html`
            <foxy-customer .data=${data} disabledcontrols="attributes:actions:create">
            </foxy-customer>
          `);

          const control = await getByTestId(element, 'attributes:actions:create');
          expect(control).to.have.attribute('disabled');
        });

        it('opens attribute form dialog on click', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const element = await fixture<Customer>(html`
            <foxy-customer
              readonlycontrols="attributes:actions:create:form:not=foo,bar"
              disabledcontrols="attributes:actions:create:form:baz"
              hiddencontrols="attributes:actions:create:form:qux"
              group="foo"
              lang="es"
              .data=${data}
            >
              <template slot="attributes:actions:create:form:items:before">Test</template>
            </foxy-customer>
          `);

          const button = await getByTestId(element, 'attributes:actions:create');
          const form = await getByTestId<FormDialog>(element, 'attributes:actions:create:form');
          const showMethod = stub(form!, 'show');

          button!.dispatchEvent(new CustomEvent('click'));

          expect(form!).to.have.attribute('readonlycontrols', 'not=foo,bar');
          expect(form!).to.have.attribute('disabledcontrols', 'baz:not=*');
          expect(form!).to.have.attribute('hiddencontrols', 'qux:not=*');
          expect(form!).to.have.attribute('header', 'create');
          expect(form!).to.have.attribute('parent', data._links['fx:attributes'].href);
          expect(form!).to.have.attribute('group', 'foo');
          expect(form!).to.have.attribute('lang', 'es');
          expect(form!).to.have.attribute('form', 'foxy-attribute-form');
          expect(form!).to.have.attribute('ns', 'customer');
          expect(form!.templates).to.have.key('items:before');

          expect(showMethod).to.have.been.called;
        });
      });
    });

    describe('list', () => {
      describe('card', () => {
        it('renders customer attributes once loaded', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const listHref = data._links['fx:attributes'].href;
          const listData = await getTestData<Core.Resource<Rels.Attributes>>(listHref);
          const element = await fixture<Customer>(html`
            <foxy-customer
              hiddencontrols="attributes:list:card:company"
              group="foo"
              lang="es"
              .data=${data}
              @fetch=${(evt: FetchEvent) => {
                if (evt.request.url !== listHref) return;
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(listData))));
              }}
            >
              <template slot="attributes:list:card:attribute-name:before">
                <div>Content</div>
              </template>
            </foxy-customer>
          `);

          const list = await getByTestId<CollectionPages<any>>(element, 'attributes:list');

          await waitUntil(() => {
            const pages = list!.querySelectorAll<CollectionPage<any>>('foxy-collection-page');
            return Array.from(pages).every(page => page.in('idle'));
          });

          const cards = list!.querySelectorAll('[data-testclass="attributes:list:card"]');

          for (let index = 0; index < cards.length; ++index) {
            const wrapper = cards[index];
            const card = wrapper.firstElementChild as AttributeCard;
            const page = card.parentElement as CollectionPage<any>;
            const cardData = listData._embedded['fx:attributes'][index];

            expect(card).to.have.attribute('hiddencontrols', 'company:not=*');
            expect(card).to.have.attribute('parent', page.href);
            expect(card).to.have.attribute('group', 'foo');
            expect(card).to.have.attribute('lang', 'es');
            expect(card).to.have.attribute('href', cardData._links.self.href);
            expect(card.templates).to.have.key('attribute-name:before');
          }
        });

        it('opens edit dialog on click', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const listHref = data._links['fx:attributes'].href;
          const listData = await getTestData<Core.Resource<Rels.Attributes>>(listHref);
          const handleFetch = (evt: FetchEvent) => {
            if (evt.request.url !== listHref) return;
            evt.respondWith(Promise.resolve(new Response(JSON.stringify(listData))));
          };

          const layout = html`<foxy-customer .data=${data} @fetch=${handleFetch}></foxy-customer>`;
          const element = await fixture<Customer>(layout);
          const list = await getByTestId<CollectionPages<any>>(element, 'attributes:list');

          await waitUntil(() => {
            const pages = list!.querySelectorAll<CollectionPage<any>>('foxy-collection-page');
            return Array.from(pages).every(page => page.in('idle'));
          });

          const button = (await getByTestClass(element, 'attributes:list:card'))[0];
          const card = button.firstElementChild as AttributeCard;
          const form = await getByTestId<FormDialog>(element, 'attributes:list:form');
          const showMethod = stub(form!, 'show');

          button.click();

          expect(showMethod).to.have.been.called;
          expect(form).to.have.property('parent', listHref);
          expect(form).to.have.property('href', card.href);
        });
      });

      describe('form', () => {
        it('relays element configuration to form', async () => {
          const element = await fixture<Customer>(html`
            <foxy-customer
              readonlycontrols="attributes:list:form:city"
              disabledcontrols="attributes:list:form:region"
              hiddencontrols="attributes:list:form:company"
              group="foo"
              lang="es"
            >
              <template slot="attributes:list:form:attribute-name:before">
                <div>Content</div>
              </template>
            </foxy-customer>
          `);

          const form = await getByTestId<FormDialog>(element, 'attributes:list:form');

          expect(form).to.have.attribute('readonlycontrols', 'city:not=*');
          expect(form).to.have.attribute('disabledcontrols', 'region:not=*');
          expect(form).to.have.attribute('hiddencontrols', 'company:not=*');
          expect(form).to.have.attribute('group', 'foo');
          expect(form).to.have.attribute('lang', 'es');
          expect(form).to.have.attribute('ns', 'customer');
          expect(form!.templates).to.have.key('attribute-name:before');
        });

        it('renders i18n key "update" in the header', async () => {
          const element = await fixture<Customer>(html`<foxy-customer></foxy-customer>`);
          const form = await getByTestId(element, 'attributes:list:form');
          expect(form).to.have.attribute('header', 'update');
        });

        it('renders with foxy-attribute-form', async () => {
          const element = await fixture<Customer>(html`<foxy-customer></foxy-customer>`);
          const form = await getByTestId(element, 'attributes:list:form');
          expect(form).to.have.attribute('form', 'foxy-attribute-form');
        });
      });

      it('is hidden when element is hidden', async () => {
        const layout = html`<foxy-customer hidden></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'attributes:list')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "attributes:list"', async () => {
        const element = await fixture<Customer>(html`
          <foxy-customer hiddencontrols="attributes:list"></foxy-customer>
        `);

        expect(await getByTestId(element, 'attributes:list')).not.to.exist;
      });

      it('is rendered with "attributes:list:before" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'attributes:list:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "attributes:list:before" template if available', async () => {
        const name = 'attributes:list:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is rendered with "attributes:list:after" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'attributes:list:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "attributes:list:after" template if available', async () => {
        const name = 'attributes:list:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });
    });
  });

  describe('payment-methods', () => {
    it('is visible by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'payment-methods')).to.exist;
    });

    it('is hidden when element is hidden', async () => {
      const layout = html`<foxy-customer hidden></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'payment-methods')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "payment-methods"', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer hiddencontrols="payment-methods"></foxy-customer>
      `);

      expect(await getByTestId(element, 'payment-methods')).not.to.exist;
    });

    it('renders "payment-methods:before" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'payment-methods:before')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "payment-methods:before" slot with template "payment-methods:before" if available', async () => {
      const name = 'payment-methods:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "payment-methods:after" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'payment-methods:after')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "payment-methods:after" slot with template "payment-methods:after" if available', async () => {
      const name = 'payment-methods:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders section header with i18n key "payment_method_plural"', async () => {
      const layout = html`<foxy-customer lang="es"></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const header = await getByKey(element, 'payment_method_plural');

      expect(header).to.have.attribute('lang', 'es');
      expect(header).to.have.attribute('ns', 'customer');
    });

    describe('list', () => {
      describe('card', () => {
        it('renders default payment method once loaded', async () => {
          const data = await getTestData<Data>('./s/admin/customers/0');
          const cardHref = data._links['fx:default_payment_method'].href;
          const cardData = await getTestData<Core.Resource<Rels.DefaultPaymentMethod>>(cardHref);
          const element = await fixture<Customer>(html`
            <foxy-customer
              .data=${data}
              @fetch=${(evt: FetchEvent) => {
                if (evt.request.url !== cardHref) return;
                evt.respondWith(Promise.resolve(new Response(JSON.stringify(cardData))));
              }}
            >
            </foxy-customer>
          `);

          const card = await getByTestId<PaymentMethodCard>(element, 'payment-methods:list:card');
          expect(card).to.have.attribute('href', cardHref);
        });

        it('relays element configuration to card', async () => {
          const element = await fixture<Customer>(html`
            <foxy-customer
              disabledcontrols="payment-methods:list:card:actions:delete"
              hiddencontrols="payment-methods:list:card:actions"
              group="foo"
              lang="es"
            >
              <template slot="payment-methods:list:card:actions:before">
                <div>Content</div>
              </template>
            </foxy-customer>
          `);

          const card = await getByTestId<PaymentMethodCard>(element, 'payment-methods:list:card');

          expect(card).to.have.attribute('disabledcontrols', 'actions:delete:not=*');
          expect(card).to.have.attribute('hiddencontrols', 'actions:not=*');
          expect(card).to.have.attribute('group', 'foo');
          expect(card).to.have.attribute('lang', 'es');
          expect(card!.templates).to.have.key('actions:before');
        });
      });

      it('is hidden when element is hidden', async () => {
        const layout = html`<foxy-customer hidden></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        expect(await getByTestId(element, 'payment-methods:list')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "payment-methods:list"', async () => {
        const element = await fixture<Customer>(html`
          <foxy-customer hiddencontrols="payment-methods:list"></foxy-customer>
        `);

        expect(await getByTestId(element, 'payment-methods:list')).not.to.exist;
      });

      it('is rendered with "payment-methods:list:before" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'payment-methods:list:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "payment-methods:list:before" template if available', async () => {
        const name = 'payment-methods:list:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('is rendered with "payment-methods:list:after" slot by default', async () => {
        const layout = html`<foxy-customer></foxy-customer>`;
        const element = await fixture<Customer>(layout);
        const slot = await getByName(element, 'payment-methods:list:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('is rendered with "payment-methods:list:after" template if available', async () => {
        const name = 'payment-methods:list:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Customer>(html`
          <foxy-customer>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-customer>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });
    });
  });

  describe('transactions', () => {
    it('renders foxy-collection-pages with foxy-transactions-table', async () => {
      const data = await getTestData<Data>('./s/admin/customers/0');
      const layout = html`
        <foxy-customer group="foo" lang="es" .data=${data}>
          <template slot="transactions:table:default"></template>
        </foxy-customer>
      `;

      const element = await fixture<Customer>(layout);
      const control = (await getByTestId(element, 'transactions')) as CollectionPages<any>;

      const transactionsURL = new URL(data._links['fx:transactions'].href);
      transactionsURL.searchParams.set('zoom', 'items');

      expect(control).to.have.attribute('first', transactionsURL.toString());
      expect(control).to.have.attribute('group', 'foo');
      expect(control).to.have.attribute('page', 'foxy-transactions-table');
      expect(control).to.have.attribute('lang', 'es');

      expect(control).to.have.property('templates');
      expect(control.templates).to.have.key('default');
    });

    it('is hidden when element is hidden', async () => {
      const layout = html`<foxy-customer hidden></foxy-customer>`;
      const element = await fixture<Customer>(layout);

      expect(await getByTestId(element, 'transactions')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "transactions"', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer hiddencontrols="transactions"></foxy-customer>
      `);

      expect(await getByTestId(element, 'transactions')).not.to.exist;
    });

    it('renders "transactions:before" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'transactions:before')).to.have.property('localName', 'slot');
    });

    it('replaces "transactions:before" slot with template "transactions:before" if available', async () => {
      const name = 'transactions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "transactions:after" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'transactions:after')).to.have.property('localName', 'slot');
    });

    it('replaces "transactions:after" slot with template "transactions:after" if available', async () => {
      const name = 'transactions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });
  });

  describe('subscriptions', () => {
    it('is hidden when element is hidden', async () => {
      const layout = html`<foxy-customer hidden></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByTestId(element, 'subscriptions')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "subscriptions"', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer hiddencontrols="subscriptions"></foxy-customer>
      `);

      expect(await getByTestId(element, 'subscriptions')).not.to.exist;
    });

    it('renders "subscriptions:before" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'subscriptions:before')).to.have.property(
        'localName',
        'slot'
      );
    });

    it('replaces "subscriptions:before" slot with template "subscriptions:before" if available', async () => {
      const name = 'subscriptions:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "subscriptions:after" slot by default', async () => {
      const layout = html`<foxy-customer></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      expect(await getByName(element, 'subscriptions:after')).to.have.property('localName', 'slot');
    });

    it('replaces "subscriptions:after" slot with template "subscriptions:after" if available', async () => {
      const name = 'subscriptions:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Customer>(html`
        <foxy-customer>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-customer>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders subscriptions in a custom foxy-table', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer
          group="foo"
          lang="es"
          href="https://demo.foxycart.com/s/admin/customers/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <template slot="subscriptions:table:default"></template>
        </foxy-customer>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));

      const pages = await getByTestId<CollectionPages<any>>(element, 'subscriptions:pages');
      const firstURL = new URL(element.data!._links['fx:subscriptions'].href);
      firstURL.searchParams.set('zoom', 'last_transaction,transaction_template:items');

      expect(pages).to.have.attribute('first', firstURL.toString());

      await waitUntil(() => pages!.in('idle'));
      const tables = await getByTestClass<Table<any>>(element, 'subscriptions:pages:table');
      await waitUntil(() => tables.every(table => table.in({ idle: 'snapshot' })));

      expect(tables).to.be.not.empty;

      for (let i = 0; i < tables.length; ++i) {
        const table = tables[i];
        const page = pages!.pages[i];

        expect(table).to.have.property('localName', 'foxy-table');
        expect(table).to.have.attribute('group', 'foo');
        expect(table).to.have.attribute('lang', 'es');
        expect(table).to.have.attribute('href', page._links.self.href);
        expect(table).to.have.nested.property('columns[0]', SubscriptionsTable.priceColumn);
        expect(table).to.have.nested.property('columns[1]', SubscriptionsTable.summaryColumn);
        expect(table).to.have.nested.property('columns[2]', SubscriptionsTable.statusColumn);

        expect(table).to.have.property('templates');
        expect(table.templates).to.have.key('default');

        const editButtons = await getByTestClass(table, 'edit');
        expect(editButtons).to.be.not.empty;

        for (let j = 0; j < editButtons.length; ++j) {
          const captionSelector = 'foxy-i18n[ns=customer][key=update][lang=es]';
          expect(editButtons[j].querySelector(captionSelector)).to.exist;
        }
      }
    });

    it('opens configurable foxy-subscription-form in a dialog on edit button click', async () => {
      const element = await fixture<Customer>(html`
        <foxy-customer
          readonlycontrols="subscriptions:form:frequency"
          disabledcontrols="subscriptions:form:not=end-date"
          hiddencontrols="subscriptions:form:transactions"
          group="foo"
          lang="es"
          href="https://demo.foxycart.com/s/admin/customers/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
          <template slot="subscriptions:form:header:before">
            <div>Test</div>
          </template>
        </foxy-customer>
      `);

      await waitUntil(() => element.in({ idle: 'snapshot' }));
      const pages = await getByTestId<CollectionPages<any>>(element, 'subscriptions:pages');
      await waitUntil(() => pages!.in('idle'));
      const [table] = await getByTestClass<Table<any>>(element, 'subscriptions:pages:table');
      await waitUntil(() => table.in({ idle: 'snapshot' }));
      const form = await getByTestId<FormDialog>(element, 'subscriptions:form');
      const showMethod = stub(form!, 'show');

      const [edit] = await getByTestClass(table, 'edit');
      edit.click();
      await element.updateComplete;

      const link = new URL(table.data._embedded['fx:subscriptions'][0]._links.self.href);
      link.searchParams.set('zoom', 'last_transaction,transaction_template:items');

      expect(showMethod).to.have.been.called;
      expect(form).to.have.attribute('readonlycontrols', 'frequency:not=*');
      expect(form).to.have.attribute('disabledcontrols', 'not=end-date');
      expect(form).to.have.attribute('hiddencontrols', 'transactions:not=*');
      expect(form).to.have.attribute('header', 'update');
      expect(form).to.have.attribute('group', 'foo');
      expect(form).to.have.attribute('form', 'foxy-subscription-form');
      expect(form).to.have.attribute('lang', 'es');
      expect(form).to.have.attribute('ns', 'customer');
      expect(form).to.have.property('href', link.toString());
      expect(form!.templates).to.have.key('header:before');
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const href = 'https://demo.foxycart.com/s/admin/sleep';
      const layout = html`<foxy-customer href=${href} lang="es"></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'customer spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const href = 'https://demo.foxycart.com/s/admin/not-found';
      const layout = html`<foxy-customer href=${href} lang="es"></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'));

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('lang', 'es');
      expect(spinner).to.have.attribute('ns', 'customer spinner');
    });

    it('hides spinner once loaded', async () => {
      const data = await getTestData('https://demo.foxycart.com/s/admin/customers/0');
      const layout = html`<foxy-customer .data=${data}></foxy-customer>`;
      const element = await fixture<Customer>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
