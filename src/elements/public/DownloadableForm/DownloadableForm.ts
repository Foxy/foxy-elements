import type { InternalDownloadableFormUploadControl } from './internal/InternalDownloadableFormUploadControl/InternalDownloadableFormUploadControl';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
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

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="group-one" label="" helper-text="">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="code"></foxy-internal-text-control>
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.downloadableItemCategories ?? void 0)}
          infer="item-category-uri"
          item="foxy-item-category-card"
        >
        </foxy-internal-resource-picker-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="group-two" label="" helper-text="">
        <foxy-internal-number-control layout="summary-item" infer="price" min="0">
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="group-three" label="" helper-text="">
        <foxy-internal-downloadable-form-upload-control infer="upload">
        </foxy-internal-downloadable-form-upload-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
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
}
