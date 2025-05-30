import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html, svg } from 'lit-html';

const NS = 'store-transaction-folder-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating and editing store transaction folders (`fx:store_transaction_folder`).
 *
 * @element foxy-store-transaction-folder-form
 * @since 1.46.0
 */
export class StoreTransactionFolderForm extends Base<Data> {
  renderBody(): TemplateResult {
    const colors: Record<string, string> = {
      'red': 'bg-folder-red text-white',
      'red_pale': 'bg-folder-red-pale text-black',
      'green': 'bg-folder-green text-white',
      'green_pale': 'bg-folder-green-pale text-black',
      'blue': 'bg-folder-blue text-white',
      'blue_pale': 'bg-folder-blue-pale text-black',
      'orange': 'bg-folder-orange text-white',
      'orange_pale': 'bg-folder-orange-pale text-black',
      'violet': 'bg-folder-violet text-white',
      'violet_pale': 'bg-folder-violet-pale text-black',
      '': 'bg-contrast-5 text-body',
    };

    const currentColor = this.form.color && this.form.color in colors ? this.form.color : '';

    return html`
      <foxy-internal-summary-control infer="group-one">
        <div class="flex flex-col items-center justify-center gap-m bg-transparent">
          <div class="flex items-center p-m rounded-full ${colors[currentColor]}">
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 2em; height: 2em;"><path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" /></svg>`}
          </div>

          <foxy-internal-text-control layout="pill" infer="name"></foxy-internal-text-control>

          <foxy-internal-store-transaction-folder-color-control infer="color" .colors=${colors}>
          </foxy-internal-store-transaction-folder-color-control>
        </div>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="group-two">
        <foxy-internal-switch-control infer="is-default" .trueAlias=${1} .falseAlias=${0}>
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  submit(): void {
    if (!this.form.name) this.edit({ name: this.t('group-one.name.placeholder') });
    super.submit();
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      return await super._fetch(...args);
    } catch (err) {
      let message;

      try {
        message = (await (err as Response).json())._embedded['fx:errors'][0].message;
      } catch {
        throw err;
      }

      if (message.includes('it has transactions in it')) {
        throw ['error:folder_not_empty'];
      } else {
        throw err;
      }
    }
  }
}
