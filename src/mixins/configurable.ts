/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Constructor, LitElement, PropertyDeclarations } from 'lit-element';

import { BooleanSelector } from '@foxy.io/sdk/core';

type Base = Constructor<LitElement> & { properties?: PropertyDeclarations };

export const ConfigurableMixin = <T extends Base>(BaseElement: T) => {
  return class ConfigurableElement extends BaseElement {
    static get properties(): PropertyDeclarations {
      return {
        ...super.properties,

        readonly: { type: Boolean, reflect: true },
        readonlyControls: {
          attribute: 'readonlycontrols',
          converter: { fromAttribute: value => new BooleanSelector(value ?? '') },
        },

        disabled: { type: Boolean, reflect: true },
        disabledControls: {
          attribute: 'disabledcontrols',
          converter: { fromAttribute: value => new BooleanSelector(value ?? '') },
        },

        hidden: { type: Boolean, reflect: true },
        hiddenControls: {
          attribute: 'hiddencontrols',
          converter: { fromAttribute: value => new BooleanSelector(value ?? '') },
        },
      };
    }

    /**
     * If true, makes every editable control inside of this element read-only.
     * This property is reflected to the `readonly` boolean attribute.
     *
     * @since 1.4.0
     */
    readonly = false;

    /**
     * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
     * controls to render as read-only. Parsed version of the `readonlycontrols` attribute value.
     *
     * @since 1.4.0
     */
    readonlyControls: BooleanSelector = BooleanSelector.False;

    /**
     * If true, disables every interactive control inside of this element.
     * This property is reflected to the `disabled` boolean attribute.
     *
     * @since 1.4.0
     */
    disabled = false;

    /**
     * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
     * controls to render as disabled.  Parsed version of the `disabledcontrols` attribute value.
     *
     * @since 1.4.0
     */
    disabledControls: BooleanSelector = BooleanSelector.False;

    /**
     * If true, hides every configurable control inside of this element.
     * This property is reflected to the `hidden` boolean attribute.
     *
     * @since 1.4.0
     */
    hidden = false;

    /**
     * [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) selecting
     * controls to hide.  Parsed version of the `hiddencontrols` attribute value.
     *
     * @since 1.4.0
     */
    hiddenControls: BooleanSelector = BooleanSelector.False;

    /**
     * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `readonlyControls`
     * and `readonly` properties. If `readonly` is true, this selector will match any control,
     * otherwise it will match the same controls as in `readonlyControls`.
     *
     * @since 1.4.0
     */
    get readonlySelector(): BooleanSelector {
      return this.readonly ? BooleanSelector.True : this.readonlyControls;
    }

    /**
     * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `disabledControls`
     * and `disabled` properties. If `disabled` is true, this selector will match any control,
     * otherwise it will match the same controls as in `disabledControls`.
     *
     * @since 1.4.0
     */
    get disabledSelector(): BooleanSelector {
      return this.disabled ? BooleanSelector.True : this.disabledControls;
    }

    /**
     * Combined [BooleanSelector](https://sdk.foxy.dev/classes/_core_index_.booleanselector.html) for `hiddenControls`
     * and `hidden` properties. If `hidden` is true, this selector will match any control,
     * otherwise it will match the same controls as in `hiddenControls`.
     *
     * @since 1.4.0
     */
    get hiddenSelector(): BooleanSelector {
      return this.hidden ? BooleanSelector.True : this.hiddenControls;
    }
  };
};
