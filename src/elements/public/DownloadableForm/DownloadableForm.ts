import type { InternalDownloadableFormUploadControl } from './internal/InternalDownloadableFormUploadControl/InternalDownloadableFormUploadControl';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

const NS = 'downloadable-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Basic form for managing `fx:downloadable` resources.
 * This element requires an augmented version of hAPI currently limited
 * only to the new Foxy Admin.
 *
 * @element foxy-downloadable-form
 * @since 1.22.0
 */
export class DownloadableForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      downloadableItemCategories: { attribute: 'downloadable-item-categories' },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ item_category_uri: v }) => !!v || 'item-category-uri:v8n_required',
      ({ file_name: v }) => !!v || 'upload:v8n_required',
      ({ price: v }) => typeof v === 'number' || 'price:v8n_required',
      ({ price: v }) => !v || v >= 0 || 'price:v8n_negative',
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => !v || v.length <= 100 || 'name:v8n_too_long',
      ({ code: v }) => !!v || 'code:v8n_required',
      ({ code: v }) => !v || v.length <= 50 || 'code:v8n_too_long',
    ];
  }

  /** URL of the `fx:downloadable_item_categories` collection for the store. */
  downloadableItemCategories: string | null = null;

  private readonly __downloadableItemCategoryLoaderId = 'downloadableItemCategoryLoader';

  get disabledSelector(): BooleanSelector {
    const alwaysDisabled: string[] = [];
    const loader = this.__downloadableItemCategoryLoader;
    if (!loader?.in('idle')) alwaysDisabled.push('item-category-uri');
    return new BooleanSelector(`${alwaysDisabled.join(' ')}${super.disabledSelector}`);
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-async-combo-box-control
        item-label-path="name"
        item-value-path="_links.self.href"
        item-id-path="_links.self.href"
        infer="item-category-uri"
        first=${ifDefined(this.downloadableItemCategories ?? void 0)}
        .selectedItem=${this.__downloadableItemCategoryLoader?.data}
        .setValue=${(newValue: string) => {
          this.edit({ item_category_uri: newValue });
          const newID = parseInt(newValue.split('/').pop() ?? '');
          if (!isNaN(newID)) this.edit({ item_category_id: newID });
        }}
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-text-control infer="name"></foxy-internal-text-control>
      <foxy-internal-text-control infer="code"></foxy-internal-text-control>
      <foxy-internal-number-control infer="price" min="0"></foxy-internal-number-control>

      <foxy-internal-downloadable-form-upload-control infer="upload">
      </foxy-internal-downloadable-form-upload-control>

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.item_category_uri || void 0)}
        id=${this.__downloadableItemCategoryLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    type UploadUrl = { upload_url: string };

    const data = await super._sendPatch(edits);
    const createUploadUrl = data._links['fx:create_upload_url'].href;
    const root = this.renderRoot;
    const control = root.querySelector<InternalDownloadableFormUploadControl>('[infer="upload"]');
    const upload = control?.uploadElement;

    if (upload && upload.files.length === 1) {
      const file = upload.files[0];
      const url = await this._fetch<UploadUrl>(createUploadUrl, {
        method: 'POST',
        body: JSON.stringify({ type: file.type }),
      });

      upload.files[0].uploadTarget = url.upload_url;
      upload.uploadFiles();
    }

    return data;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    type UploadUrl = { upload_url: string };

    const data = await super._sendPost(edits);
    const createUploadUrl = data._links['fx:create_upload_url'].href;
    const root = this.renderRoot;
    const control = root.querySelector<InternalDownloadableFormUploadControl>('[infer="upload"]');
    const upload = control?.uploadElement;

    if (upload && upload.files.length === 1) {
      const file = upload.files[0];
      const url = await this._fetch<UploadUrl>(createUploadUrl, {
        method: 'POST',
        body: JSON.stringify({ type: file.type }),
      });

      upload.files[0].uploadTarget = url.upload_url;
      upload.uploadFiles();
    }

    return data;
  }

  private get __downloadableItemCategoryLoader() {
    type Loader = NucleonElement<Resource<Rels.ItemCategory>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__downloadableItemCategoryLoaderId}`);
  }
}
