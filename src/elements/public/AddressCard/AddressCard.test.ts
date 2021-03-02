import './index';

import { AddressCard } from './AddressCard';
import { Data } from './types';
import { FormDialog } from '../FormDialog/FormDialog';
import { I18n } from '../I18n/I18n';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  wrapper: HTMLButtonElement;
  dialog: FormDialog;
  line1: I18n;
  line2: I18n;
  line3: I18n;
  icon: HTMLElement; // iron-icon
};

describe('AddressCard', () => {
  generateTests<Data, AddressCard, Refs>({
    tag: 'foxy-address-card',
    href: 'https://demo.foxycart.com/s/admin/customer_addresses/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/addresses',
    maxTestsPerState: 5,
    isEmptyValid: true,
    assertions: {
      async busy({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');

        expect(refs.line1).to.be.undefined;
        expect(refs.line2).to.be.undefined;
        expect(refs.line3).to.be.undefined;
      },

      async idle({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');

        expect(refs.line1).to.have.property('key', 'line_1');
        expect(refs.line1).to.have.property('lang', element.lang);
        expect(refs.line1).to.have.deep.property('opts', element.form);

        expect(refs.line2).to.have.property('key', 'line_2');
        expect(refs.line2).to.have.property('lang', element.lang);
        expect(refs.line2).to.have.deep.property('opts', element.form);

        expect(refs.line3).to.have.property('key', 'line_3');
        expect(refs.line3).to.have.property('lang', element.lang);
        expect(refs.line3).to.have.deep.property('opts', element.form);

        expect(refs.dialog).to.have.property('parent', element.parent);
        expect(refs.dialog).to.have.property('href', element.href);
        expect(refs.dialog).to.have.property('lang', element.lang);

        if (element.form.is_default_billing) {
          expect(refs.icon).to.have.property('icon', 'icons:payment');
        } else if (element.form.is_default_shipping) {
          expect(refs.icon).to.have.property('icon', 'maps:local-shipping');
        } else {
          expect(refs.icon).to.be.undefined;
        }
      },

      async fail({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');

        expect(refs.line1).to.be.undefined;
        expect(refs.line2).to.be.undefined;
        expect(refs.line3).to.be.undefined;
      },
    },
  });
});
