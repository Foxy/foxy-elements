import type { PropertyDeclarations } from 'lit-element';
import { InternalControl } from '../InternalControl/InternalControl';

export class InternalEditableControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      placeholder: { type: String, noAccessor: true },
      helperText: { type: String, attribute: 'helper-text', noAccessor: true },
      v8nPrefix: { type: String, attribute: 'v8n-prefix', noAccessor: true },
      property: { type: String, noAccessor: true },
      label: { type: String, noAccessor: true },
    };
  }

  private __placeholder: string | null = null;

  private __helperText: string | null = null;

  private __v8nPrefix: string | null = null;

  private __property: string | null = null;

  private __label: string | null = null;

  get placeholder(): string {
    return typeof this.__placeholder === 'string' ? this.__placeholder : this.t('placeholder');
  }

  set placeholder(newValue: string) {
    this.requestUpdate('placeholder', this.__placeholder);
    this.__placeholder = newValue;
  }

  get helperText(): string {
    return typeof this.__helperText === 'string' ? this.__helperText : this.t('helper_text');
  }

  set helperText(newValue: string) {
    this.requestUpdate('helperText', this.__helperText);
    this.__helperText = newValue;
  }

  get v8nPrefix(): string {
    if (typeof this.__v8nPrefix === 'string') return this.__v8nPrefix;
    if (typeof this.infer === 'string') return `${this.infer}:`;
    return '';
  }

  set v8nPrefix(newValue: string) {
    this.requestUpdate('v8nPrefix', this.__v8nPrefix);
    this.__v8nPrefix = newValue;
  }

  get property(): string {
    if (typeof this.__property === 'string') return this.__property;
    if (typeof this.infer === 'string') return this.infer.replace(/-/g, '_');
    return '';
  }

  set property(newValue: string) {
    this.requestUpdate('property', this.__property);
    this.__property = newValue;
  }

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

  protected get _value(): unknown | undefined {
    return this.nucleon?.form[this.property];
  }

  protected set _value(newValue: unknown | undefined) {
    const event = new CustomEvent('change', { cancelable: true, detail: newValue });
    const useDefaultAction = this.dispatchEvent(event);
    if (useDefaultAction) this.nucleon?.edit({ [this.property]: newValue });
  }

  protected get _error(): string | undefined {
    return this.nucleon?.errors.find(v => v.startsWith(this.v8nPrefix));
  }

  protected get _errorMessage(): string | undefined {
    return this._error ? this.t(this._error.substring(this.v8nPrefix.length)) : undefined;
  }

  protected get _checkValidity(): () => boolean {
    return () => !this._error;
  }
}
