import './index';

import { Choice, ConfirmDialogElement, DialogElement } from '../../private';

import { AttributeFormElement } from './AttributeFormElement';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Data } from './types';
import { SpinnerElement } from '../Spinner/SpinnerElement';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  name: TextFieldElement;
  value: TextFieldElement;
  spinner: SpinnerElement;
  delete: ButtonElement;
  create: ButtonElement;
  confirm: ConfirmDialogElement;
  visibility: Choice;
};

describe('AttributeFormElement', () => {
  generateTests<Data, AttributeFormElement, Refs>({
    tag: 'foxy-attribute-form',
    href: 'https://demo.foxycart.com/s/admin/customer_attributes/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/attributes',
    maxTestsPerState: 3,

    invalidate(form) {
      return { ...form, name: '', value: '' };
    },

    actions: {
      async delete({ refs, element }) {
        refs.delete.click();
        await element.updateComplete;
        refs.confirm.dispatchEvent(new DialogElement.HideEvent());
      },

      async submit({ refs }) {
        refs.name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      },

      async edit({ form, refs }) {
        refs.name.value = form.name;
        refs.name.dispatchEvent(new InputEvent('input'));

        refs.value.value = form.name;
        refs.value.dispatchEvent(new InputEvent('input'));
      },
    },

    assertions: {
      fail({ refs }) {
        expect(refs.spinner, 'renders spinner in error state').not.to.be.null;
        expect(refs.spinner).to.have.property('state', 'error');
      },

      busy({ refs }) {
        expect(refs.spinner, 'renders spinner').not.to.be.null;
        expect(refs.spinner).to.have.attribute('state', 'busy');

        expect(refs.name).to.have.attribute('disabled');
        expect(refs.value).to.have.attribute('disabled');
        expect(refs.visibility).to.have.attribute('disabled');

        if (refs.delete) expect(refs.delete).to.have.attribute('disabled');
        if (refs.create) expect(refs.create).to.have.attribute('disabled');
      },

      idle: {
        test({ element, refs }) {
          expect(refs.spinner, "doesn't render spinner").to.be.undefined;
          expect(refs.name).to.have.property('value', element.form.name ?? '');
          expect(refs.value).to.have.property('value', element.form.value ?? '');
          expect(refs.visibility).to.have.property('value', element.form.visibility ?? 'private');
        },

        snapshot({ refs }) {
          expect(refs.delete).not.to.have.attribute('disabled');
        },

        template: {
          clean: {
            valid({ refs }) {
              expect(refs.create).not.to.have.attribute('disabled');
            },

            invalid({ refs }) {
              expect(refs.create).to.have.attribute('disabled');
            },
          },

          dirty: {
            valid({ refs }) {
              expect(refs.create).not.to.have.attribute('disabled');
            },

            invalid({ refs }) {
              expect(refs.create).to.have.attribute('disabled');
            },
          },
        },
      },
    },
  });
});
