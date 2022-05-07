import type { PropertyDeclarations } from 'lit-element';
import { InternalControl } from '../InternalControl/InternalControl';

export class InternalEditableControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __placeholder: { attribute: false },
      __helperText: { attribute: false },
      __v8nPrefix: { attribute: false },
      __property: { attribute: false },
      __label: { attribute: false },
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
    this.__placeholder = newValue;
  }

  get helperText(): string {
    return typeof this.__helperText === 'string' ? this.__helperText : this.t('helper_text');
  }

  set helperText(newValue: string) {
    this.__helperText = newValue;
  }

  get v8nPrefix(): string {
    return typeof this.__v8nPrefix === 'string' ? this.__v8nPrefix : `${this.infer}:`;
  }

  set v8nPrefix(newValue: string) {
    this.__v8nPrefix = newValue;
  }

  get property(): string {
    return typeof this.__property === 'string' ? this.__property : this.infer.replace(/-/g, '_');
  }

  set property(newValue: string) {
    this.__property = newValue;
  }

  get label(): string {
    return typeof this.__label === 'string' ? this.__label : this.t('label');
  }

  set label(newValue: string) {
    this.__label = newValue;
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
    return this._error ? this.t(this._error.substring(0, this.v8nPrefix.length)) : undefined;
  }

  protected get _checkValidity(): () => boolean {
    return () => !this._error;
  }
}
