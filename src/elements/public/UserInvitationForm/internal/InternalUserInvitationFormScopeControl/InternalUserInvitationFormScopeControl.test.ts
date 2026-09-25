import type { InternalUserInvitationFormScopeControl as Control } from './InternalUserInvitationFormScopeControl';
import type { InternalSelectControl } from '../../../../internal/InternalSelectControl/InternalSelectControl';
import type { InternalSwitchControl } from '../../../../internal/InternalSwitchControl/InternalSwitchControl';

import './index';

import { expect, fixture, html } from '@open-wc/testing';
import { COLLECTIONS } from '../../../../../utils/group-invitation-scopes';
import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { spy } from 'sinon';

const allReads = COLLECTIONS.map(collection => `${collection}_read`).join(' ');

const control = async (granterScope: string, scope = '') => {
  const element = await fixture<Control>(html`
    <foxy-internal-user-invitation-form-scope-control granter-scope=${granterScope}>
    </foxy-internal-user-invitation-form-scope-control>
  `);

  element.getValue = () => scope;
  await element.requestUpdate();

  return element;
};

// The preset radio group is gone -- there is now exactly one preset control, a
// `foxy-internal-select-control[layout="summary-item"]` whose options are the offerable
// presets. `data-preset` (a presence marker, not a per-value key the way `data-collection`/
// `data-resend` are, since there's only ever one of these) is its stable hook.
const presetControl = (element: Control) => {
  return element.renderRoot.querySelector<InternalSelectControl>(
    'foxy-internal-select-control[data-preset]'
  );
};

const presets = (element: Control) => {
  return presetControl(element)?.options.map(option => option.value) ?? [];
};

const presetSelect = (element: Control) => {
  return presetControl(element)?.renderRoot.querySelector('select') ?? null;
};

const selectPreset = (element: Control, preset: string) => {
  const select = presetSelect(element)!;
  select.value = preset;
  select.dispatchEvent(new Event('change'));
};

describe('InternalUserInvitationFormScopeControl', () => {
  it('extends InternalEditableControl', () => {
    const element = document.createElement('foxy-internal-user-invitation-form-scope-control');
    expect(element).to.be.instanceOf(InternalEditableControl);
  });

  it('offers every preset to a store_full_access granter', async () => {
    expect(presets(await control('store_full_access'))).to.deep.equal(['store', 'read', 'custom']);
  });

  it('omits the store preset when the granter lacks store_full_access', async () => {
    expect(presets(await control(allReads))).to.deep.equal(['read', 'custom']);
  });

  it('omits the read preset when the granter cannot grant all reads', async () => {
    expect(presets(await control('customers_read'))).to.deep.equal(['custom']);
  });

  it('selects no preset for an empty scope', async () => {
    const element = await control('store_full_access', '');
    expect(presetSelect(element)?.value).to.not.be.ok;
  });

  it('selects the store preset for store_full_access', async () => {
    const element = await control('store_full_access', 'store_full_access');
    expect(presetSelect(element)?.value).to.equal('store');
  });

  it('writes the wildcard when the store preset is chosen', async () => {
    const element = await control('store_full_access');
    let written: unknown = null;
    element.setValue = value => (written = value);

    selectPreset(element, 'store');

    expect(written).to.equal('store_full_access');
  });

  it('writes all 20 reads when the read preset is chosen', async () => {
    const element = await control('store_full_access');
    let written: unknown = null;
    element.setValue = value => (written = value);

    selectPreset(element, 'read');

    expect(written).to.equal(allReads);
  });

  it('renders a preset the invitation already holds but the granter cannot grant, still displayed as the value', async () => {
    const element = await control(allReads, 'store_full_access');

    // The out-of-reach preset must still be an offered option (see the control's comment on
    // `mismatchedPreset`) -- otherwise the native `<select>` would have no matching `<option>`
    // to display at all.
    expect(presets(element)).to.include('store');
    expect(presetSelect(element)?.value).to.equal('store');
  });

  // `summary-item` layout hides the native `<select>` entirely while readonly, rather than
  // disabling one specific option the way the old vaadin-radio-group did (see the level and
  // resend equivalents of this test for the same layout choice, and its same narrower
  // guarantee: hidden from real interaction, not internally guarded against a synthetic
  // `change` event).
  it('hides the preset select from interaction while the control is locked, still showing its value as text', async () => {
    const element = await control(allReads, 'store_full_access');
    await presetControl(element)?.updateComplete;

    expect(presetSelect(element)?.hasAttribute('hidden')).to.be.true;
  });

  // The preset select's own label names what it selects ("Access level"), distinct from its
  // wrapping summary control's "Permissions" section title -- same reasoning as each collection
  // row's own label naming its collection rather than repeating the section heading. A shared
  // `label` between the two would either read as a visible duplicate or (if left blank on one)
  // leave an empty label gap or no accessible name at all.
  it("gives the preset select its own label naming what it selects, distinct from the section's", async () => {
    const element = await control('store_full_access', 'customers_read');
    const summary = presetControl(element)?.closest('foxy-internal-summary-control') as
      | InternalEditableControl
      | null
      | undefined;

    expect(presetControl(element)?.label).to.equal(element.t('preset_label'));
    expect(summary?.label).to.equal(element.label);
    expect(presetControl(element)?.label).to.not.equal(summary?.label);
  });

  it('does not warn on a fresh empty-scope render', async () => {
    const warn = spy(console, 'warn');
    try {
      await control('store_full_access', '');
      expect(warn.called).to.be.false;
    } finally {
      warn.restore();
    }
  });
});

// Each row is now one self-contained `foxy-internal-select-control[layout="summary-item"]` --
// `data-collection` moves onto that element directly (see the control's `styles`/`renderControl`
// doc comments for why there's no per-row wrapper `<div>` any more).
const rows = (element: Control) => {
  return [
    ...element.renderRoot.querySelectorAll('foxy-internal-select-control[data-collection]'),
  ].map(row => row.getAttribute('data-collection'));
};

const selectCustom = async (element: Control) => {
  selectPreset(element, 'custom');
  await element.requestUpdate();
};

const levelControl = (element: Control, collection: string) => {
  return element.renderRoot.querySelector<InternalSelectControl>(
    `foxy-internal-select-control[data-collection="${collection}"]`
  );
};

const levelsFor = (element: Control, collection: string) => {
  return levelControl(element, collection)?.options.map(option => option.value) ?? [];
};

// `summary-item` layout renders a real native `<select>` (see `__renderSummaryItemLayout` in
// InternalSelectControl.ts), directly in the row control's own `renderRoot` -- one level of
// shadow-piercing, same as the combo-box the row used before this rework.
const levelSelect = (element: Control, collection: string) => {
  return levelControl(element, collection)?.renderRoot.querySelector('select') ?? null;
};

// The compact text next to the (invisible, overlaid) `<select>` -- `.truncate` in
// `__renderSummaryItemLayout` -- is what a sighted user actually sees as the row's current
// value, same role `displayedLevelText` played against the old combo-box's own visible input.
const displayedLevelText = (element: Control, collection: string) => {
  return levelControl(element, collection)
    ?.renderRoot.querySelector('.truncate')
    ?.textContent?.trim();
};

const setLevel = (element: Control, collection: string, level: string) => {
  const select = levelSelect(element, collection)!;
  select.value = level;
  select.dispatchEvent(new Event('change'));
};

const resendSwitch = (element: Control, collection: string) => {
  return element.renderRoot.querySelector<InternalSwitchControl>(
    `foxy-internal-switch-control[data-resend="${collection}"]`
  );
};

// `InternalSwitchControl` renders a real native `<input type="checkbox">` (see
// InternalSwitchControl.ts) *only* when it isn't readonly -- when readonly it renders static
// "checked"/"unchecked" text instead and the `<input>` doesn't exist in the DOM at all (a
// stronger, unconditional guarantee than the level select's `?hidden=` below -- see "does not
// let a mismatched resend grant be toggled while the control is locked").
const resendInput = (element: Control, collection: string) => {
  return resendSwitch(element, collection)?.renderRoot.querySelector('input') ?? null;
};

const setResend = (element: Control, collection: string, checked: boolean) => {
  const input = resendInput(element, collection)!;
  input.checked = checked;
  input.dispatchEvent(new Event('change'));
};

describe('custom matrix', () => {
  it('renders no rows until custom is chosen', async () => {
    expect(rows(await control('store_full_access', ''))).to.be.empty;
  });

  it('renders a row per collection once custom is chosen', async () => {
    const element = await control('store_full_access', '');
    await selectCustom(element);

    expect(rows(element)).to.have.lengthOf(20);
  });

  it('renders rows for a scope that is already custom', async () => {
    const element = await control('store_full_access', 'customers_read');
    expect(rows(element)).to.have.lengthOf(20);
  });

  it('offers only grantable levels per row', async () => {
    const element = await control('customers_read carts_read carts_write', 'customers_read');

    expect(levelsFor(element, 'customers')).to.deep.equal(['none', 'read']);
    expect(levelsFor(element, 'carts')).to.deep.equal(['none', 'read', 'full']);
    expect(levelsFor(element, 'coupons')).to.deep.equal(['none']);
  });

  it('writes both tokens when a row is set to full', async () => {
    const element = await control('store_full_access', '');
    await selectCustom(element);

    let written: unknown = null;
    element.setValue = value => (written = value);

    setLevel(element, 'customers', 'full');

    expect(written).to.equal('customers_read customers_write');
  });

  // The native `<select>` `summary-item` renders has no reachable "empty" option for a real
  // user (its one blank `<option>` is `disabled hidden` -- see `__renderSummaryItemLayout`), so
  // this scenario is no longer something the UI itself can produce the way clicking
  // vaadin-combo-box's clear ("x") button once could. `.setValue`'s defensive coercion is kept
  // anyway (there is still no "no level" state distinct from `none`), so this now exercises
  // that defensive floor directly rather than a real interaction path.
  it('treats an empty value the same as explicitly setting a row to none', async () => {
    const element = await control('store_full_access', 'customers_read');

    let written: unknown = null;
    element.setValue = value => (written = value);

    const select = levelSelect(element, 'customers')!;
    select.value = '';
    select.dispatchEvent(new Event('change'));

    // The invitation held only `customers_read`; clearing that row drops it, leaving every
    // collection at `none` and nothing else set -- the empty string, not `null`/`undefined`.
    expect(written).to.equal('');
  });

  it('renders a resend switch only for resendable collections', async () => {
    const element = await control('store_full_access', 'customers_read');

    expect(resendSwitch(element, 'transactions')).to.exist;
    expect(resendSwitch(element, 'customers')).to.not.exist;
  });

  it('omits the resend switch when the granter cannot grant resend', async () => {
    const element = await control('transactions_read', 'transactions_read');
    expect(resendSwitch(element, 'transactions')).to.not.exist;
  });

  it('gives each resend switch a label naming its collection', async () => {
    const element = await control('store_full_access', 'customers_read');
    const expected = `${element.t('resend')} ${element.t('scopes.transactions').toLowerCase()}`;

    expect(resendSwitch(element, 'transactions')?.label).to.equal(expected);
  });

  it('adds the resend token independently of the level', async () => {
    const element = await control('store_full_access', 'customers_read');

    let written: unknown = null;
    element.setValue = value => (written = value);

    setResend(element, 'transactions', true);

    expect(written).to.equal('customers_read transactions_resend');
  });

  it('renders a row level the invitation already holds but the granter cannot grant, still displayed as the row value', async () => {
    const element = await control('customers_read', 'customers_write');

    // The out-of-reach level must still be an offered option (see the control's comment on
    // `mismatchedLevel`) -- otherwise the native `<select>` would have no matching `<option>`
    // to display at all.
    expect(levelsFor(element, 'customers')).to.include('full');
    expect(levelSelect(element, 'customers')?.value).to.equal('full');

    // The summary-item's own visible text -- not just the underlying `.value` property, which
    // would pass trivially -- must actually display the out-of-reach level.
    expect(displayedLevelText(element, 'customers')).to.equal(element.t('level_full'));
  });

  // `summary-item` layout hides the native `<select>` entirely while readonly
  // (`?hidden=${this.readonly}`, see `__renderSummaryItemLayout`) rather than the old
  // vaadin-combo-box's own internal readonly guard (`open()` a no-op while `readonly`). That
  // means the guarantee here is narrower than it used to be: a real user has no way to reach
  // the select while it's hidden, but nothing in `summary-item`'s own `@change` handler checks
  // `readonly` itself, so a *synthetic* change event dispatched directly at the (still-present,
  // merely hidden) element still writes -- confirmed empirically; see this task's report. This
  // test therefore pins what's actually guaranteed (hidden from interaction, value still shown
  // as text) rather than an interaction-level guard this layout doesn't have.
  it('hides the level select from interaction while the control is locked, still showing its value as text', async () => {
    const element = await control('customers_read', 'customers_write');

    // The row control infers its own `readonly` asynchronously from this control (see the
    // `updated()` doc comment on the control), on its own microtask separate from this
    // control's own render -- wait for it before asserting on it, same fix as Task 3 needed for
    // reading a nested internal control's post-inference state.
    await levelControl(element, 'customers')?.updateComplete;

    const select = levelSelect(element, 'customers')!;
    expect(select.hasAttribute('hidden')).to.be.true;
    expect(displayedLevelText(element, 'customers')).to.equal(element.t('level_full'));
  });

  it('renders a resend switch the invitation already holds but the granter cannot grant, showing it checked', async () => {
    const element = await control('transactions_read', 'transactions_read transactions_resend');
    const switchControl = resendSwitch(element, 'transactions');

    expect(switchControl).to.exist;

    // A resend mismatch is itself grounds for `__hasUnreachableGrant` to lock the *entire*
    // control (see that method) -- there is no scenario where a mismatched switch exists but
    // isn't also readonly, so the switch's own readonly rendering (checked/unchecked text, no
    // `<input>`, see `resendInput`) is what actually keeps it from being toggled; no separate
    // per-switch `disabled` is set (see `__renderResendSwitches`).
    await switchControl?.updateComplete;
    expect(switchControl?.readonly).to.be.true;
    expect(resendInput(element, 'transactions')).to.not.exist;
    expect(switchControl?.renderRoot.textContent).to.include(element.t('checked'));
  });

  it('does not let a mismatched resend grant be toggled while the control is locked', async () => {
    const element = await control('transactions_read', 'transactions_read transactions_resend');
    let written: unknown = null;
    element.setValue = value => (written = value);

    // Unlike the level select (merely `hidden`), a readonly switch renders no `<input>` at all
    // -- there is nothing to dispatch a synthetic event at, a strictly stronger guarantee.
    expect(resendInput(element, 'transactions'), 'a readonly switch renders no input').to.not.exist;

    expect(written).to.equal(null);
  });

  it('keeps the matrix open when an edit makes the selection match another preset', async () => {
    const scopeMinusOne = COLLECTIONS.filter(collection => collection !== 'customers')
      .map(collection => `${collection}_read`)
      .join(' ');

    const element = await control('store_full_access', scopeMinusOne);
    expect(rows(element)).to.have.lengthOf(20);

    let currentScope: unknown = scopeMinusOne;
    element.getValue = () => currentScope;
    element.setValue = value => (currentScope = value);

    setLevel(element, 'customers', 'read');

    await element.requestUpdate();

    expect(currentScope).to.equal(allReads);
    expect(rows(element)).to.have.lengthOf(20);
  });

  it('gives each row a real label naming its collection, associated with its select', async () => {
    const element = await control('store_full_access', 'customers_read');
    const rowControl = levelControl(element, 'customers');

    // `label` (not a sibling `foxy-i18n`, and not an `aria-label` workaround -- both gone in
    // this rework) is what `summary-item` renders as a real `<label for="select">` (see
    // `__renderSummaryItemLayout`), giving the row a genuine accessible name.
    expect(rowControl?.label).to.equal(element.t('scopes.customers'));

    const label = rowControl?.renderRoot.querySelector('label');
    const select = levelSelect(element, 'customers');

    expect(label?.textContent?.trim()).to.equal(element.t('scopes.customers'));
    expect(label?.getAttribute('for')).to.equal(select?.id);

    // No visible duplicate: an unset `helperText` resolves to `t('helper_text')`, which would
    // otherwise show the wrong string ("You can only grant access you have yourself.") under
    // every one of the 20 rows.
    expect(rowControl?.helperText).to.equal('');
  });

  // `stores_read` is what authorizes `GET /stores/{id}` and the `/stores` listing -- without
  // it a user cannot load the store page or the store picker, so "no store access" isn't a
  // real choice for this one row. Only the write bit is optional. Scope includes `stores_read`
  // itself so the row's current level is already `read` (not `none`) -- otherwise `none` would
  // still be a "mismatched", currently-held value the row must keep displayable (see the next
  // test), which would make this assertion collide with that one for an identical input.
  it('does not offer None for the stores row', async () => {
    const element = await control('store_full_access', 'stores_read customers_read');
    expect(levelsFor(element, 'stores')).to.deep.equal(['read', 'full']);
  });

  it('still offers None for every other row', async () => {
    const element = await control('store_full_access', 'customers_read');
    expect(levelsFor(element, 'customers')).to.deep.equal(['none', 'read', 'full']);
  });

  // This isn't just a legacy/API-import edge case -- it's the default state of every brand new
  // invitation, since nothing grants `stores_*` until an admin explicitly sets this row (this
  // is exactly what the browser check saw: the playground story renders "None" here out of the
  // box). `none` is no longer offerable, so the row's value would sit outside its own option
  // list and render blank unless the current value is always included.
  it('still shows a stores level of none when the invitation has no stores scope', async () => {
    const element = await control('store_full_access', 'customers_read');

    expect(levelsFor(element, 'stores')).to.include('none');
    expect(levelSelect(element, 'stores')?.value).to.equal('none');
  });

  // The case above makes `mismatchedLevel === 'none'` reachable for the stores row in an
  // otherwise perfectly ordinary, unlocked state (a granter with full access editing an
  // invitation that simply hasn't touched stores yet) -- new territory, since before this
  // task a mismatch only ever meant "the granter can't re-grant this level", which always
  // implies the lock. `canGrantLevel` returns `true` unconditionally for `none` (see
  // `invitation-scope.ts`), and `__hasUnreachableGrant` calls it directly rather than going
  // through this row's narrowed `offerable` list, so this new case must not trip the lock.
  it('does not lock the control merely because the stores row is at its mismatched-but-grantable none', async () => {
    const element = await control('store_full_access', 'customers_read');
    await presetControl(element)?.updateComplete;
    expect(presetControl(element)?.readonly).to.be.false;
  });
});

describe('row layout at narrow widths', () => {
  // Regression guard for the clipping bug found and fixed while this control still rendered
  // vaadin-combo-box rows (see this task's report for the full history): a label sitting next
  // to a shrinkable sibling, with `overflow: hidden` on the label itself, silently truncated
  // real text under pressure. `summary-item`'s own label (`text-m text-body flex-1
  // whitespace-nowrap`, see `__renderSummaryItemLayout`) has no `overflow: hidden`, so its
  // automatic flex minimum size is its own full text width, not zero -- it structurally cannot
  // be squeezed below its content, the same property the old fix aimed for, now built into the
  // shared control's own default layout rather than something this control has to arrange.
  // Verified directly across nine realistic widths (375/480/620/640/760/900/1024/1280/1440,
  // matching the two-column breakpoint and its surroundings) via scrollWidth/clientWidth in a
  // live Storybook render -- zero rows clipped at any of them (see this task's report). This
  // test adds a synthetic, far-narrower-than-realistic check as a standing regression guard;
  // it isn't the primary evidence for "no label may clip", the width-by-width browser
  // measurement is.
  //
  // The row's own value text (`.truncate` in `__renderSummaryItemLayout`) is a different
  // matter -- it's *designed* to ellipsize under pressure, same as any select. A clip there is
  // expected UX, not a bug, and isn't asserted against here.
  it('never clips any row label, even forced far narrower than any label could need', async () => {
    const element = await control('store_full_access', 'customers_read');
    const clipped: string[] = [];

    for (const collection of COLLECTIONS) {
      const row = levelControl(element, collection)!;
      row.style.width = '100px';
      // eslint-disable-next-line no-await-in-loop
      await row.updateComplete;

      const label = row.renderRoot.querySelector('label')!;
      if (label.scrollWidth > label.clientWidth + 1) clipped.push(collection);
    }

    expect(clipped).to.deep.equal([]);
  });
});

describe('locking on an unreachable grant', () => {
  it('makes the whole control readonly when the invitation holds a level the granter cannot re-grant', async () => {
    const element = await control('customers_read', 'customers_write');
    await presetControl(element)?.updateComplete;
    expect(presetControl(element)?.readonly).to.be.true;
  });

  it('still renders the out-of-reach level as the row value, hidden from interaction, while locked', async () => {
    const element = await control('customers_read', 'customers_write');
    await levelControl(element, 'customers')?.updateComplete;

    const select = levelSelect(element, 'customers');

    expect(select?.hasAttribute('hidden')).to.be.true;
    expect(select?.value).to.equal('full');
    expect(displayedLevelText(element, 'customers')).to.equal(element.t('level_full'));
  });

  it('locks on a preset the granter cannot re-grant, not just on row-level mismatches', async () => {
    const element = await control(allReads, 'store_full_access');
    await presetControl(element)?.updateComplete;
    expect(presetControl(element)?.readonly).to.be.true;
  });

  it('locks on a resend grant the granter cannot re-extend', async () => {
    const element = await control('transactions_read', 'transactions_read transactions_resend');
    await presetControl(element)?.updateComplete;
    expect(presetControl(element)?.readonly).to.be.true;
  });

  it('shows the locked helper text only while locked', async () => {
    const locked = await control('customers_read', 'customers_write');
    const unlocked = await control('store_full_access', 'customers_read');

    const lockedSummary = presetControl(locked)?.closest('foxy-internal-summary-control');
    const unlockedSummary = presetControl(unlocked)?.closest('foxy-internal-summary-control');

    expect((lockedSummary as InternalEditableControl | null)?.helperText).to.equal(
      locked.t('helper_text_locked')
    );
    expect((unlockedSummary as InternalEditableControl | null)?.helperText).to.equal(
      unlocked.t('helper_text')
    );
  });

  // The regression guard that matters most: an over-broad predicate would silently freeze
  // the normal editing path for a granter who holds everything the invitation does.
  it('does not lock a granter who can re-grant everything the invitation holds', async () => {
    const element = await control('store_full_access', 'customers_read');
    await presetControl(element)?.updateComplete;
    expect(presetControl(element)?.readonly).to.be.false;
  });

  it('still lets a granter who can re-grant everything edit the matrix', async () => {
    const element = await control('store_full_access', 'customers_read');
    let written: unknown = null;
    element.setValue = value => (written = value);

    setLevel(element, 'customers', 'full');

    expect(written).to.equal('customers_read customers_write');
  });
});
