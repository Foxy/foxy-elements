import '../../public/CustomerForm/index';

import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import { getTestData } from '../../../testgen/getTestData';
import { InternalControl } from '../InternalControl/InternalControl';
import { InternalTimestampsControl } from './index';
import { CustomerForm } from '../../public/CustomerForm/CustomerForm';

describe('InternalTimestampsControl', () => {
  it('imports and defines foxy-internal-control', () => {
    expect(customElements.get('foxy-internal-control')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-internal-timestamps-control', () => {
    expect(customElements.get('foxy-internal-timestamps-control')).to.equal(
      InternalTimestampsControl
    );
  });

  it('extends InternalControl', () => {
    expect(new InternalTimestampsControl()).to.be.instanceOf(InternalControl);
  });

  it('renders creation date in the first row', async () => {
    const testData = await getTestData<any>('./hapi/customers/0');
    const testForm = await fixture<CustomerForm>(html`
      <foxy-customer-form .data=${testData}>
        <foxy-internal-timestamps-control infer="timestamps"></foxy-internal-timestamps-control>
      </foxy-customer-form>
    `);

    const control = testForm.firstElementChild as InternalTimestampsControl;
    const table = control.renderRoot.querySelector('table') as HTMLTableElement;
    const label = table.rows[0].cells[0].querySelector('foxy-i18n[key="date_created"]');
    const value = table.rows[0].cells[1].querySelector('foxy-i18n[key="date"]');

    expect(label).to.exist;
    expect(label).to.have.property('infer', '');

    expect(value).to.exist;
    expect(value).to.have.property('infer', '');
    expect(value).to.have.deep.property('options', { value: testForm.form.date_created });
  });

  it('renders last modification date in the second row', async () => {
    const testData = await getTestData<any>('./hapi/customers/0');
    const testForm = await fixture<CustomerForm>(html`
      <foxy-customer-form .data=${testData}>
        <foxy-internal-timestamps-control infer="timestamps"></foxy-internal-timestamps-control>
      </foxy-customer-form>
    `);

    const control = testForm.firstElementChild as InternalTimestampsControl;
    const table = control.renderRoot.querySelector('table') as HTMLTableElement;
    const label = table.rows[1].cells[0].querySelector('foxy-i18n[key="date_modified"]');
    const value = table.rows[1].cells[1].querySelector('foxy-i18n[key="date"]');

    expect(label).to.exist;
    expect(label).to.have.property('infer', '');

    expect(value).to.exist;
    expect(value).to.have.property('infer', '');
    expect(value).to.have.deep.property('options', { value: testForm.form.date_modified });
  });
});
