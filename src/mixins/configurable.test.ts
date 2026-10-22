import { LitElement } from 'lit-element';
import { BooleanSelector } from '@foxy.io/sdk/core';
import '../elements/public/UserInvitationForm/index';
import { expect, fixture, html } from '@open-wc/testing';
import { ConfigurableMixin } from './configurable';
import { InferrableMixin } from './inferrable';
import type { ScopeCollection, ScopeRule } from '../utils/user-scope';

class TestElement extends ConfigurableMixin(InferrableMixin(LitElement)) {
  get scopeCollection(): ScopeCollection | null {
    return 'transactions';
  }

  get scopeRules(): ScopeRule[] {
    return [{ path: 'customer', collection: 'customers', readonlyIfNoWrite: true }];
  }
}

customElements.define('x-configurable-test', TestElement);

class ThrowingRulesElement extends ConfigurableMixin(InferrableMixin(LitElement)) {
  get scopeRules(): ScopeRule[] {
    throw new Error('scopeRules must not be read without a scope');
  }
}

customElements.define('x-configurable-throwing-rules-test', ThrowingRulesElement);

const settle = async (el: TestElement) => {
  await el.updateComplete;
  await new Promise(resolve => setTimeout(resolve));
};

describe('ConfigurableMixin', () => {
  describe('current user scope', () => {
    it('leaves selectors unchanged when no scope is set', async () => {
      const el = await fixture<TestElement>(
        html`<x-configurable-test hiddencontrols="foo"></x-configurable-test>`
      );

      expect(el.currentUserScope).to.be.null;
      expect(el.hiddenSelector.toString()).to.equal(new BooleanSelector('foo').toString());
      expect(el.readonlySelector.toString()).to.equal(BooleanSelector.False.toString());
    });

    it('hides and locks controls according to the scope', async () => {
      const el = await fixture<TestElement>(
        html`<x-configurable-test current-user-scope="transactions_read"></x-configurable-test>`
      );

      expect(el.hiddenSelector.matches('customer', true)).to.be.true;
      expect(el.hiddenSelector.matches('delete', true)).to.be.true;
      expect(el.readonlySelector.matches('anything', true)).to.be.true;
    });

    it('keeps consumer hiddencontrols alongside rule paths', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test
          current-user-scope="transactions_read"
          hiddencontrols="foo"
        ></x-configurable-test>
      `);

      expect(el.hiddenSelector.matches('foo', true)).to.be.true;
      expect(el.hiddenSelector.matches('customer', true)).to.be.true;
    });

    it('makes a path readonly when the rule asks for it', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test
          current-user-scope="transactions_write customers_read"
        ></x-configurable-test>
      `);

      expect(el.readonlySelector.matches('customer', true)).to.be.true;
      expect(el.readonlySelector.matches('other', true)).to.be.false;
    });

    it('is inferred by nested elements', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test current-user-scope="customers_read">
          <x-configurable-test infer></x-configurable-test>
        </x-configurable-test>
      `);

      const child = el.firstElementChild as TestElement;
      await child.updateComplete;
      await new Promise(resolve => setTimeout(resolve));
      expect(child.currentUserScope).to.equal('customers_read');
    });

    it('is unchanged for store_full_access', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test
          current-user-scope="store_full_access store_id_1"
          hiddencontrols="foo"
        ></x-configurable-test>
      `);

      expect(el.hiddenSelector.toString()).to.equal(new BooleanSelector('foo').toString());
      expect(el.readonlySelector.toString()).to.equal(BooleanSelector.False.toString());
    });

    it('does not overwrite an explicit scope with an inherited empty scope', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test current-user-scope="">
          <x-configurable-test infer current-user-scope="customers_read"></x-configurable-test>
        </x-configurable-test>
      `);

      const child = el.firstElementChild as TestElement;
      await child.updateComplete;
      await new Promise(resolve => setTimeout(resolve));
      expect(child.currentUserScope).to.equal('customers_read');
    });

    it('does not overwrite the scope of a nested invitation form with an inherited null', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test>
          <foxy-user-invitation-form infer current-user-scope="customers_read">
          </foxy-user-invitation-form>
        </x-configurable-test>
      `);

      const child = el.firstElementChild as TestElement;
      await child.updateComplete;
      await new Promise(resolve => setTimeout(resolve));
      expect(child.currentUserScope).to.equal('customers_read');
    });

    it('does not overwrite an explicit scope with an inherited null', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test>
          <x-configurable-test infer current-user-scope="customers_read"></x-configurable-test>
        </x-configurable-test>
      `);

      const child = el.firstElementChild as TestElement;
      await child.updateComplete;
      await new Promise(resolve => setTimeout(resolve));
      expect(child.currentUserScope).to.equal('customers_read');
    });

    it('does not read scope rules when no scope is set', async () => {
      const el = await fixture<ThrowingRulesElement>(
        html`<x-configurable-throwing-rules-test></x-configurable-throwing-rules-test>`
      );

      expect(() => el.hiddenSelector).to.not.throw();
      expect(() => el.readonlySelector).to.not.throw();
    });

    it('reads the scope from a plain ancestor when it has no infer attribute', async () => {
      const root = await fixture(html`
        <div .currentUserScope=${'customers_read'}><x-configurable-test></x-configurable-test></div>
      `);

      const el = root.firstElementChild as TestElement;
      await el.updateComplete;

      expect(el.currentUserScope).to.equal('customers_read');
      expect(el.readonlySelector.toString()).to.equal(new BooleanSelector('customer').toString());
    });

    it('keeps an explicit scope when it has no infer attribute', async () => {
      const root = await fixture(html`
        <div .currentUserScope=${'customers_read'}>
          <x-configurable-test current-user-scope="transactions_read"></x-configurable-test>
        </div>
      `);

      const el = root.firstElementChild as TestElement;
      await el.updateComplete;

      expect(el.currentUserScope).to.equal('transactions_read');
    });

    it('resets an inherited scope when the ancestor clears it', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test current-user-scope="customers_read">
          <x-configurable-test infer></x-configurable-test>
        </x-configurable-test>
      `);

      const child = el.firstElementChild as TestElement;
      await settle(child);
      expect(child.currentUserScope).to.equal('customers_read');

      el.currentUserScope = null;
      await settle(el);
      await settle(child);
      expect(child.currentUserScope).to.be.null;
    });

    it('keeps an explicit scope when the ancestor clears its scope', async () => {
      const el = await fixture<TestElement>(html`
        <x-configurable-test current-user-scope="customers_read">
          <x-configurable-test infer></x-configurable-test>
        </x-configurable-test>
      `);

      const child = el.firstElementChild as TestElement;
      await settle(child);
      expect(child.currentUserScope).to.equal('customers_read');

      child.currentUserScope = 'transactions_read';
      await settle(child);
      el.currentUserScope = '';
      await settle(el);
      await settle(child);
      expect(child.currentUserScope).to.equal('transactions_read');
    });
  });
});
