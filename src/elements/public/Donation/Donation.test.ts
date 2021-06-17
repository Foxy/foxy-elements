import * as amounts from './test/amounts.test';
import * as anonymity from './test/anonymity.test';
import * as comment from './test/comment.test';
import * as designations from './test/designations.test';
import * as frequencies from './test/frequencies.test';
import * as metadata from './test/metadata.test';
import * as misconfigured from './test/misconfigured.test';
import { expect, fixture } from '@open-wc/testing';
import { Donation } from './Donation';
import { DonationSubmitEvent } from './DonationSubmitEvent';
import { Refs } from './test/types';
import { getRefs } from '../../../utils/test-utils';

customElements.define('foxy-donation', Donation);

describe('foxy-donation', () => {
  describe('misconfigured', () => {
    const layout = `<foxy-donation></foxy-donation>`;

    misconfigured.plans.forEach(plan => {
      describe(plan.description, () => {
        plan.paths.forEach(path => {
          it(path.description, async () => path.test(await fixture(layout)));
        });
      });
    });

    describe('has full coverage', () => {
      it('yes', () => misconfigured.model.testCoverage());
    });
  });

  describe('configured', () => {
    const layout = `<foxy-donation currency="usd" amount="25" store="foxy-demo" name="Donation"></foxy-donation>`;
    const suites = [designations, frequencies, anonymity, amounts, comment, metadata];

    suites.forEach(suite => {
      describe(suite.model.machine.id, () => {
        suite.model.getShortestPathPlans().forEach(plan => {
          describe(plan.description, () => {
            plan.paths.forEach(path => {
              it(path.description, async () => path.test(await fixture(layout)));
            });
          });
        });

        describe('has full coverage', () => {
          it('yes', () => suite.model.testCoverage());
        });
      });
    });

    describe('submission', () => {
      it('emits cancelable "submit" event on .submit()', async () => {
        const element = await fixture<Donation>(layout);
        const onEvent = new Promise(resolve => {
          const opts = { once: true };
          element.addEventListener('submit', evt => (evt.preventDefault(), resolve(evt)), opts);
        });

        element.submit();

        expect(await onEvent).to.be.instanceOf(DonationSubmitEvent);
      });

      it('emits cancelable "submit" event upon clicking submit button', async () => {
        const element = await fixture<Donation>(layout);
        const onEvent = new Promise(resolve => {
          const opts = { once: true };
          element.addEventListener('submit', evt => (evt.preventDefault(), resolve(evt)), opts);
        });

        getRefs<Refs>(element).submit?.click();

        expect(await onEvent).to.be.instanceOf(DonationSubmitEvent);
      });
    });
  });
});
