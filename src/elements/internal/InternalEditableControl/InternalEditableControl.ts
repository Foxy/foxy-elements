import type { PropertyDeclarations } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';

import debounce from 'lodash-es/debounce';

/**
 * An internal base class for controls that have editing functionality, e.g. a text field.
 * Instances of this class will provide shortcuts for translatable placeholder, label, helper
 * text and more. Unlike a regular control, editable control can not only read from a NucleonElement
 * instance up the DOM tree, but also send changes to it and trigger validation process.
 *
 * @element foxy-internal-editable-control
 * @since 1.17.0
 */
export class InternalEditableControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      checkValidityAsync: { attribute: false },
      placeholder: { type: String, noAccessor: true },
      helperText: { type: String, attribute: 'helper-text', noAccessor: true },
      v8nPrefix: { type: String, attribute: 'v8n-prefix', noAccessor: true },
      getValue: { attribute: false },
      setValue: { attribute: false },
      property: { type: String, noAccessor: true },
      label: { type: String, noAccessor: true },
      __asyncError: { attribute: false },
    };
  }

  checkValidityAsync: ((value: unknown) => Promise<true | string>) | null = null;

  getValue = (): unknown => this.nucleon?.form[this.property];

  setValue = (newValue: unknown): void => this.nucleon?.edit({ [this.property]: newValue });

  private __debouncedCheckValidityAsync = debounce(async (newValue: unknown) => {
    const validOrError = await this.checkValidityAsync?.(newValue);
    if (this._value !== newValue) return;
    this.__asyncError = validOrError === true ? null : validOrError ?? null;
  }, 300);

  private __previousValue: unknown | null = null;

  private __placeholder: string | null = null;

  private __helperText: string | null = null;

  private __asyncError: string | null = null;

  private __v8nPrefix: string | null = null;

  private __property: string | null = null;

  private __label: string | null = null;

  /**
   * Translated placeholder text for this control. You can set your own placeholder text
   * if the default key in the inferred namespace doesn't work for you. Use `.resetPlaceholder()`
   * to restore the default translation.
   */
  get placeholder(): string {
    return typeof this.__placeholder === 'string' ? this.__placeholder : this.t('placeholder');
  }

  set placeholder(newValue: string) {
    this.requestUpdate('placeholder', this.__placeholder);
    this.__placeholder = newValue;
  }

  /**
   * Translated helper text for this control. You can set your own helper text
   * if the default key in the inferred namespace doesn't work for you. Use `.resetHelperText()`
   * to restore the default translation.
   */
  get helperText(): string {
    return typeof this.__helperText === 'string' ? this.__helperText : this.t('helper_text');
  }

  set helperText(newValue: string) {
    this.requestUpdate('helperText', this.__helperText);
    this.__helperText = newValue;
  }

  /**
   * A prefix for all v8n errors related to this control. You can set your own v8n prefix
   * if the default one doesn't work for you. Use `.resetV8nPrefix()`
   * to restore the default v8n prefix.
   */
  get v8nPrefix(): string {
    if (typeof this.__v8nPrefix === 'string') return this.__v8nPrefix;
    if (typeof this.infer === 'string') return `${this.infer}:`;
    return '';
  }

  set v8nPrefix(newValue: string) {
    this.requestUpdate('v8nPrefix', this.__v8nPrefix);
    this.__v8nPrefix = newValue;
  }

  /**
   * Name of the property to bind to inferred from the control name by converting it to snake_case.
   * You can set your own property name if the default inference method produces an incorrect result.
   * Use `.resetProperty()` to restore the default property name.
   */
  get property(): string {
    if (typeof this.__property === 'string') return this.__property;
    if (typeof this.infer === 'string') return this.infer.replace(/-/g, '_');
    return '';
  }

  set property(newValue: string) {
    this.requestUpdate('property', this.__property);
    this.__property = newValue;
  }

  /**
   * Translated label for this control. You can set your own label if the default key in the inferred
   * namespace doesn't work for you. Use `.resetLabel()` to restore the default translation.
   */
  get label(): string {
    return typeof this.__label === 'string' ? this.__label : this.t('label');
  }

  set label(newValue: string) {
    this.requestUpdate('label', this.__label);
    this.__label = newValue;
  }

  /** Restores the default placeholder translation. */
  resetPlaceholder(): void {
    this.requestUpdate('placeholder', this.__placeholder);
    this.__placeholder = null;
  }

  /** Restores the default helper text translation. */
  resetHelperText(): void {
    this.requestUpdate('helperText', this.__helperText);
    this.__helperText = null;
  }

  /** Restores the default v8n prefix for errors. */
  resetV8nPrefix(): void {
    this.requestUpdate('v8nPrefix', this.__v8nPrefix);
    this.__v8nPrefix = null;
  }

  /** Restores the default property name. */
  resetProperty(): void {
    this.requestUpdate('property', this.__property);
    this.__property = null;
  }

  /** Restores the default label translation. */
  resetLabel(): void {
    this.requestUpdate('label', this.__label);
    this.__label = null;
  }

  reportValidity(): void {
    const walker = this.ownerDocument.createTreeWalker(this.renderRoot, NodeFilter.SHOW_ELEMENT);

    do {
      type Input = Node & Record<string, () => unknown>;

      const node = walker.currentNode as Input;
      const methods = ['reportValidity', 'validate'];

      for (const method of methods) {
        if (method in node) {
          try {
            node[method]();
            break;
          } catch {
            continue;
          }
        }
      }
    } while (walker.nextNode());
  }

  /**
   * A shortcut to get the inferred value from the NucleonElement instance
   * up the DOM tree. If no such value or instance exists, returns `undefined`.
   * Assigning a value to this property will dispatch a cancelable `change` event
   * with the new value in the detail and write changes to the NucleonElement instance if permitted.
   */
  protected get _value(): unknown | undefined {
    return this.getValue();
  }

  protected set _value(newValue: unknown | undefined) {
    this.__previousValue = this._value;
    this.__asyncError = null;
    if (!this._error && this.__previousValue !== newValue) {
      this.__debouncedCheckValidityAsync(newValue);
    }

    const event = new CustomEvent('change', { cancelable: true, detail: newValue });
    const useDefaultAction = this.dispatchEvent(event);
    if (useDefaultAction) this.setValue(newValue);
  }

  /** A shortcut returning the first v8n error associated with this control. */
  protected get _error(): string | undefined {
    const syncError = this.nucleon?.errors.find(v => v.startsWith(this.v8nPrefix));
    return syncError ?? this.__asyncError ?? void 0;
  }

  /** A shortcut returning the localized text of the first v8n error associated with this control. */
  protected get _errorMessage(): string | undefined {
    return this._error ? this.t(this._error.substring(this.v8nPrefix.length)) : undefined;
  }

  /** A helper returning a `.checkValidity()` function for use with Vaadin elements. */
  protected get _checkValidity(): () => boolean {
    return () => !this._error;
  }
}
