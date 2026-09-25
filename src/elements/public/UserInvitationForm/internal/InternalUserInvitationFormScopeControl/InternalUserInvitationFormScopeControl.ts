import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Option } from '../../../../internal/InternalSelectControl/types';
import type { Level, Selection } from '../../../../../utils/invitation-scope';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { COLLECTIONS, RESENDABLE } from '../../../../../utils/group-invitation-scopes';
import { css } from 'lit-element';
import { html } from 'lit-html';

import {
  canGrantLevel,
  canGrantReadPreset,
  canGrantResend,
  getGrantable,
  parseScope,
  serializeScope,
} from '../../../../../utils/invitation-scope';

type Preset = 'store' | 'read' | 'custom';

/**
 * Lets an admin choose which scopes an invitation grants, offering only what the granting
 * user already holds.
 *
 * Bound to the invitation's `scope` string through `infer="scope"`. The server is the real
 * enforcement boundary; this control exists so the UI
 * never offers a grant that would be rejected.
 *
 * @element foxy-internal-user-invitation-form-scope-control
 */
export class InternalUserInvitationFormScopeControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      granterScope: { attribute: 'granter-scope' },
      __customSelected: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        /*
         * \`foxy-internal-summary-control\` puts \`::slotted(*) { min-width: 100% }\` on
         * whatever it slots, and (outside \`layout="section"\`) a background/padding on each
         * slotted element too -- both aimed at a vertical list of full-width summary-items, and
         * both outside this control's reach: they're declared against the *slotted* elements
         * from the summary control's own shadow tree, not against anything inside this one, so
         * there is no selector this control's own \`static styles\` could write that would stop
         * a slotted element from being full-width, and the grid that would need a second
         * \`grid-template-columns\` track lives inside the summary control's own shadow root --
         * not reachable at all from here (confirmed: a \`::slotted(*)\` rule only ever targets
         * the slotted elements themselves, never the host's own internal structure around the
         * \`<slot>\`). So overriding a rule of ours against the slotted elements, per CSS
         * Scoping's normal-declarations-in-the-tree-the-element-lives-in-beat-::slotted()-rule
         * precedence, can only ever affect how each *individual* slotted box is sized -- it
         * cannot make the summary control itself lay two of them out side by side, because nothing
         * this control writes can reach that summary control's own internal grid container.
         *
         * So there is exactly one slotted child here: \`.matrix\`, a wrapper \`<div>\` (see
         * \`renderControl\`) that lays its own 20 real children out in a grid this control fully
         * owns. \`layout="section"\` on the summary control (see \`renderControl\`) opts out of its
         * background/padding-on-slotted-child rule, since that would otherwise tint the *whole*
         * wrapper as one block; this control re-creates the summary-item tile look itself, on
         * each *individual* row, below.
         */
        .matrix {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 1px;
          border-radius: var(--lumo-border-radius);
          overflow: hidden;
        }

        @media all and (min-width: 640px) {
          .matrix {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          }
        }

        /*
         * Each row is one \`foxy-internal-select-control[layout="summary-item"]\`, a single
         * self-contained element (see \`__renderLevelControl\`) -- no more per-row wrapper,
         * sibling label, or separate checkbox. Its own background here (rather than
         * \`::slotted(*)\`'s, opted out of above) is what recreates the individual-tile look;
         * the 1px \`.matrix\` gap on top of \`var(--lumo-contrast-10pct)\` shows through between
         * every row *and* column as a hairline divider, in both directions -- a container-level
         * \`divide-y\` (this control's previous approach, before the summary-item rework) only
         * ever divides one axis, which draws a confusing line between the two columns' cells of
         * the same visual row; a grid gap does not have that problem.
         */
        .matrix > foxy-internal-select-control {
          background-color: var(--lumo-contrast-5pct);
          padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px);
        }
      `,
    ];
  }

  /** Space-separated scope of the user creating or editing the invitation. */
  granterScope: string | null = null;

  /**
   * Set when the admin picks `Custom` explicitly. Needed because an empty scope parses to a
   * `null` preset, so without this the radio would snap back to nothing selected the moment
   * `Custom` was chosen but before any row was set.
   */
  private __customSelected = false;

  /**
   * Cached outcome of `__hasUnreachableGrant` from the most recently completed `renderControl()`
   * pass. Read by `updated()` below -- see its doc comment for why the lock needs to land on
   * `this.readonly` itself rather than staying a `renderControl()`-local variable.
   */
  private __isLocked = false;

  renderControl(): TemplateResult {
    const selection = parseScope(this.__scope);
    const grantable = getGrantable(this.granterScope ?? void 0);
    const currentPreset = this.__preset(selection);
    const presets: Preset[] = [];

    if (grantable.storeFullAccess) presets.push('store');
    if (canGrantReadPreset(grantable)) presets.push('read');
    presets.push('custom');

    // The invitation can already hold a preset this granter couldn't offer themselves --
    // e.g. a full-access admin created it, and a narrower admin is now editing it. Omitting
    // it would make an existing grant look like no grant at all, so it's still listed as an
    // option (the same treatment `__renderLevelControl` gives an out-of-reach row level) --
    // otherwise `summary-item`'s displayed value would fall back to its placeholder instead
    // of showing the invitation's actual preset. `custom` is always offered and `null`
    // selects nothing, so only `store` and `read` can end up here.
    const mismatchedPreset =
      currentPreset && !presets.includes(currentPreset) ? currentPreset : null;

    const renderedPresets: Preset[] = (['store', 'read', 'custom'] as const).filter(
      preset => presets.includes(preset) || preset === mismatchedPreset
    );

    // The invitation can hold a grant this granter cannot themselves re-grant (see
    // `__hasUnreachableGrant`, which treats a mismatched preset as grounds to lock on its
    // own). The API validates the *entire* submitted `scope` string
    // whenever it's dirty, not just the delta, so any edit here would re-serialize and
    // resubmit that out-of-reach value and the server would reject the whole save -- a
    // failure the admin cannot fix, because there is no way to *only* change the preset
    // without touching the rest. Locking the whole control instead means no edit, and
    // therefore no failing save, can be attempted. The out-of-reach value stays visible,
    // same as always -- only editability changes. Because a mismatched preset already forces
    // `isLocked` (and therefore `readonly`) below, no separate per-option disabling is needed
    // here either -- the same reasoning `__renderLevelControl` and `__renderResendSwitches`
    // already rely on for their own mismatches.
    const isLocked = this.__hasUnreachableGrant(selection, grantable, !!mismatchedPreset);

    // Read by `updated()` below -- see its doc comment for why the lock also needs to land on
    // the `readonly` *property* itself, not just this render pass's local variable.
    this.__isLocked = isLocked;

    const readonly = this.readonly || isLocked;
    const helperText = isLocked ? this.t('helper_text_locked') : this.helperText;

    const presetOptions: Option[] = renderedPresets.map(preset => ({
      label: `preset_${preset}`,
      value: preset,
    }));

    return html`
      <div class="grid gap-m">
        <foxy-internal-summary-control infer="" label=${this.label} helper-text=${helperText}>
          <foxy-internal-select-control
            layout="summary-item"
            infer=""
            label=${this.t('preset_label')}
            helper-text=""
            data-preset=""
            ?disabled=${this.disabled}
            ?readonly=${readonly}
            .options=${presetOptions}
            .getValue=${() => currentPreset ?? undefined}
            .setValue=${(newValue: unknown) => this.__selectPreset(newValue as Preset)}
          >
          </foxy-internal-select-control>
        </foxy-internal-summary-control>
        ${currentPreset === 'custom'
          ? html`
              <div class="matrix">
                ${COLLECTIONS.map(collection =>
                  this.__renderLevelControl(collection, selection, grantable, readonly)
                )}
              </div>
              ${this.__renderResendSwitches(selection, grantable, readonly)}
            `
          : ''}
      </div>
    `;
  }

  /**
   * Reflects a lock onto the real `readonly` property (in addition to whatever `updated()`
   * itself, e.g. `renderControl()`'s own `?readonly=` bindings, already did with the local
   * variable) once the initial render has committed.
   *
   * This exists because each row is now a nested `foxy-internal-select-control`.
   * `ConfigurableMixin` makes every such control infer its own `readonly` from the nearest
   * ancestor that has one (this control), by reading `this.readonly` directly during an async
   * walk (`InferrableMixin.inferFromElement`'s `key in element` check) -- not from whatever a
   * template attribute happened to bind on the row. That walk re-runs on every one of this
   * control's own updates (`InferrableMixin.updated()` calls `inferPropertiesInDescendants()`
   * unconditionally), so a row bound only via `?readonly=${this.readonly || isLocked}` in
   * `renderControl()` is overwritten back to whatever `this.readonly` was moments later --
   * confirmed empirically by a probe test, see this task's report. Setting `this.readonly`
   * itself is what the row's own inference actually reads, so this is not a workaround so much
   * as the property meaning what it says: locked really does mean the whole control, including
   * everything nested inside it, is readonly.
   *
   * Assigning inside `updated()` rather than `renderControl()`/`render()` matters too: mutating
   * a reactive property mid-render is what triggers lit's "scheduled an update... during
   * update" warning (and the `does not warn on a fresh empty-scope render` test would catch
   * it); `updated()` is the lifecycle hook lit itself documents for deriving follow-up state
   * from a completed render, and setting a property there does not warn.
   *
   * Never resets `this.readonly` back to `false` on its own -- the externally-imposed half
   * (e.g. the form's own `readonlycontrols` selector matching `scope`) is owned entirely by
   * `ConfigurableMixin`'s own inheritance, which keeps re-asserting its own value on every
   * update independently of this method.
   */
  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (this.__isLocked && !this.readonly) this.readonly = true;
  }

  /**
   * `true` when the invitation already holds something this granter could not themselves
   * grant: the current preset isn't among the ones offered, a collection's current level
   * isn't grantable at that level, or a collection currently has a resend grant the granter
   * cannot extend. Reuses `canGrantLevel` / `canGrantResend` rather than reimplementing
   * grantability -- see `renderControl` for why this forces the whole control readonly.
   */
  private __hasUnreachableGrant(
    selection: Selection,
    grantable: ReturnType<typeof getGrantable>,
    hasMismatchedPreset: boolean
  ): boolean {
    if (hasMismatchedPreset) return true;

    const hasUnreachableLevel = COLLECTIONS.some(collection => {
      return !canGrantLevel(grantable, collection, selection.levels[collection] ?? 'none');
    });

    if (hasUnreachableLevel) return true;

    return selection.resend.some(collection => !canGrantResend(grantable, collection));
  }

  /**
   * Renders one collection's level picker as a self-contained `foxy-internal-select-control`
   * in `summary-item` layout: a native `<select>` with a real `<label for="select">` (the
   * collection name, passed via `label`, replacing both the old sibling `foxy-i18n` and the
   * `aria-label` workaround that stood in for a proper accessible name before this control had
   * one) plus the current value shown as compact text. `data-collection` moves onto this
   * element directly -- there's no separate row wrapper left to carry it (see the control's
   * `styles` for why one output element per collection, not a wrapper `<div>` per row, is what
   * lets this control own its own two-column grid).
   */
  private __renderLevelControl(
    collection: string,
    selection: Selection,
    grantable: ReturnType<typeof getGrantable>,
    readonly: boolean
  ): TemplateResult {
    const allLevels: Level[] = ['none', 'read', 'full'];
    const currentLevel = selection.levels[collection] ?? 'none';

    // `stores_read` is what authorizes `GET /stores/{id}` and the `/stores` listing --
    // without it a user cannot load the store page or the store picker, so "no store access"
    // is not a real choice for this row going forward: this row's own select can only ever be
    // set to `read` or `full` from here on. This narrows what a user can newly *choose*, not
    // what a scope string already contains -- an invitation whose stores row has simply never
    // been touched (imported via the API, or edited only through a different row) still
    // parses `stores` as `none` and is written that way; see `mismatchedLevel` below for how
    // that value stays displayable without being treated as an unreachable grant.
    const offerable: Level[] = collection === 'stores' ? ['read', 'full'] : allLevels;
    const available = offerable.filter(level => canGrantLevel(grantable, collection, level));

    // The option list must be the grantable levels for this row, PLUS the row's current level
    // if it is not grantable/offerable. `vaadin-combo-box` reconciles its displayed value
    // against `.items` on every `.value`/`.items` change (verified directly, see the control's
    // test suite and this task's report), and the native `<select>` `summary-item` renders
    // behaves the same way for an unlisted `<option>` -- an out-of-reach current level not
    // present in `.options` would fail to display at all. `none` is always grantable (see
    // `canGrantLevel`), so for every collection except `stores` only `read` or `full` can end
    // up here as a mismatch -- but a legacy or API-created invitation can hold no `stores_*`
    // tokens at all, which parses to `none`, and `none` is no longer offerable for that one
    // row, so `none` itself can be the mismatch there.
    //
    // No per-option disabling is needed for a level the granter truly cannot re-grant:
    // `__hasUnreachableGrant` already forces the *entire* control readonly the instant any row
    // holds such a level, so that kind of mismatch can only ever be rendered while the whole
    // row control is already readonly. The `stores` row's own `none` mismatch is different --
    // `canGrantLevel` returns `true` unconditionally for `'none'` (see `invitation-scope.ts`),
    // so it is a *legal* grant the granter could re-issue, not an unreachable one. It does not
    // trip `__hasUnreachableGrant`, and is rendered editable while the rest of the control
    // stays unlocked (pinned by this control's own test suite: "does not lock the control
    // merely because the stores row is at its mismatched-but-grantable none"). Either way, the
    // out-of-reach value is simply the control's value.
    const mismatchedLevel = available.includes(currentLevel) ? null : currentLevel;

    // Filtered from `allLevels`, not the narrowed `offerable` list: for the `stores` row,
    // `none` was removed from `offerable` above, but an invitation with no `stores_*` tokens
    // still parses its current level as `none`. Filtering from `offerable` here would drop
    // `none` from the rendered options even when it's `mismatchedLevel`, leaving the select's
    // value absent from its own option list -- the same "current value must stay a real
    // option" rule as the `mismatchedLevel` fallback right above, just applied one filter
    // earlier where a narrower source list can undo it.
    const renderedLevels = allLevels.filter(
      level => available.includes(level) || level === mismatchedLevel
    );

    const options: Option[] = renderedLevels.map(level => ({
      label: `level_${level}`,
      value: level,
    }));

    return html`
      <foxy-internal-select-control
        layout="summary-item"
        infer=""
        label=${this.t(`scopes.${collection}`)}
        helper-text=""
        data-collection=${collection}
        ?disabled=${this.disabled}
        ?readonly=${readonly}
        .options=${options}
        .getValue=${() => currentLevel}
        .setValue=${(newValue: unknown) => {
          // The native `<select>` `summary-item` renders always has a real selection (its
          // first, disabled placeholder `<option>` aside) once a value is set, so there is no
          // "clear" affordance to coerce here the way the old vaadin-combo-box row needed --
          // kept anyway as the same defensive floor: there is no "no level" state for a row,
          // and this must never let an empty/undefined token reach the serialized scope.
          this.__setLevel(collection, ((newValue as string) || 'none') as Level);
        }}
      >
      </foxy-internal-select-control>
    `;
  }

  /**
   * Renders the three resendable collections' resend grants as `foxy-internal-switch-control`s,
   * one per line, in their own `foxy-internal-summary-control` -- not folded into the level
   * grid above. Resend is a secondary, independent axis (a collection's level and its resend
   * grant are unrelated tokens -- see `parseScope`/`serializeScope`), covers only 3 of the 20
   * collections, and doesn't need the level grid's two-column treatment; keeping it as its own
   * section also means the grid's CSS (sized for 20 short rows) never has to accommodate a
   * structurally different kind of row. Renders nothing at all if the granter can't grant (and
   * the invitation doesn't already hold) any resend permission, rather than an empty section.
   */
  private __renderResendSwitches(
    selection: Selection,
    grantable: ReturnType<typeof getGrantable>,
    readonly: boolean
  ): TemplateResult | string {
    const switches = RESENDABLE.map(collection => {
      const hasResend = selection.resend.includes(collection);
      const canResend = canGrantResend(grantable, collection);

      // Mirrors the level mismatch in `__renderLevelControl`: the invitation can already carry
      // a resend grant this granter can no longer extend themselves. Unlike the level mismatch,
      // this needs no *separate* `disabled` condition below -- `__hasUnreachableGrant` already
      // treats any resend mismatch as grounds to lock the *entire* control (see its own return
      // statement), so `mismatchedResend` and this control's own `readonly` are never true/false
      // independently of each other; adding a redundant `?disabled=` term here would only be
      // exercising `foxy-internal-switch-control`'s `disabled` -- a `ConfigurableMixin`-inferred
      // property subject to the exact same ancestor-inference-can-overwrite-a-template-binding
      // risk documented on this control's own `updated()`, for a case that can't actually occur.
      const mismatchedResend = hasResend && !canResend;

      return { collection, hasResend, mismatchedResend, show: canResend || mismatchedResend };
    }).filter(entry => entry.show);

    if (!switches.length) return '';

    return html`
      <foxy-internal-summary-control infer="" label="" helper-text="">
        ${switches.map(
          ({ collection, hasResend }) => html`
            <foxy-internal-switch-control
              infer=""
              label=${`${this.t('resend')} ${this.t(`scopes.${collection}`).toLowerCase()}`}
              helper-text=""
              data-resend=${collection}
              ?disabled=${this.disabled}
              ?readonly=${readonly}
              .getValue=${() => hasResend}
              .setValue=${(newValue: unknown) => this.__setResend(collection, !!newValue)}
            >
            </foxy-internal-switch-control>
          `
        )}
      </foxy-internal-summary-control>
    `;
  }

  private __setLevel(collection: string, level: Level): void {
    // Touching a row is proof the admin is actively editing in custom mode. Without this, an
    // edit that happens to make the selection match another preset (e.g. the last collection
    // reaching `read`) would make `__preset` fall back to `parseScope`'s classification and the
    // matrix would vanish out from under the admin mid-edit.
    this.__customSelected = true;

    const selection = parseScope(this.__scope);
    selection.levels[collection] = level;
    this._value = serializeScope({ ...selection, preset: 'custom' });
  }

  private __setResend(collection: string, checked: boolean): void {
    this.__customSelected = true;

    const selection = parseScope(this.__scope);

    const resend = checked
      ? [...selection.resend, collection]
      : selection.resend.filter(entry => entry !== collection);

    this._value = serializeScope({ ...selection, preset: 'custom', resend });
  }

  /** The scope currently in the form. Undefined before the first edit on a new invitation. */
  private get __scope(): string | undefined {
    return (this._value as string | undefined) ?? void 0;
  }

  private __preset(selection: Selection): Preset | null {
    if (this.__customSelected) return 'custom';
    return selection.preset;
  }

  private __selectPreset(preset: Preset): void {
    this.__customSelected = preset === 'custom';

    // Choosing Custom keeps whatever is already in the form, so the matrix opens on the
    // current grant rather than wiping it -- true for enumerated scopes. The wildcard is the
    // exception: `parseScope('store_full_access')` reads all 20 collection levels as `none`,
    // so switching from the store preset to Custom shows "no access to anything" here even
    // though the form still holds full store access until a row is actually edited.
    if (preset === 'custom') return;

    if (preset === 'store') {
      this._value = 'store_full_access';
    } else {
      const selection = parseScope('');
      COLLECTIONS.forEach(collection => (selection.levels[collection] = 'read'));
      this._value = serializeScope(selection);
    }
  }
}
