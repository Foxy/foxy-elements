import type { DownloadableForm } from '../../DownloadableForm';
import type { UploadElement } from '@vaadin/vaadin-upload';

import { html, TemplateResult } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../../../utils/class-map';

export class InternalDownloadableFormUploadControl extends InternalControl {
  private __ignoreNextFilesChange = false;

  get uploadElement(): UploadElement | null {
    return this.renderRoot.querySelector<UploadElement>('vaadin-upload');
  }

  renderControl(): TemplateResult {
    return html`
      <vaadin-upload
        max-file-size="524288000"
        max-files=${ifDefined(this.disabled || this.readonly ? '0' : '2')}
        class=${classMap({
          'foxy-downloadable-form-upload transition-colors p-0 rounded-none': true,
          'text-disabled': this.disabled,
        })}
        method="PUT"
        no-auto
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .i18n=${this.__uploadI18n}
        @files-changed=${this.__handleFilesChanged}
        @upload-request=${this.__handleUploadRequest}
      >
      </vaadin-upload>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    const nucleon = this.nucleon as DownloadableForm | null;
    const upload = this.renderRoot.querySelector<UploadElement>('vaadin-upload');

    if (upload && nucleon) {
      if (nucleon.in({ idle: { snapshot: 'clean' } }) && upload.files.length === 0) {
        this.__ignoreNextFilesChange = true;
        upload.files = [
          // @ts-expect-error type doesn't match but it's ok because vaadin docs suggest this as a solution
          {
            complete: true,
            progress: 100,
            status: this.t('status_complete'),
            name: nucleon.data.file_name,
          },
        ];
      } else if (nucleon.in({ idle: { template: 'clean' } })) {
        this.__ignoreNextFilesChange = true;
        upload.files = [];
      }
    }
  }

  private get __uploadI18n() {
    return {
      dropFiles: {
        one: this.t('drop_label'),
        many: this.t('drop_label'),
      },
      addFiles: {
        one: this.t('select_label'),
        many: this.t('select_label'),
      },
      cancel: this.t('cancel'),
      error: {
        tooManyFiles: this.t('error_too_many_files'),
        fileIsTooBig: this.t('error_too_big'),
        incorrectFileType: '',
      },
      uploading: {
        status: {
          connecting: this.t('status_connecting'),
          stalled: this.t('status_stalled'),
          processing: this.t('status_processing'),
          held: this.t('status_held'),
        },
        remainingTime: {
          prefix: this.t('remaining_prefix'),
          unknown: this.t('remaining_unknown'),
        },
        error: {
          serverUnavailable: this.t('error_server_unavailable'),
          unexpectedServerError: this.t('error_unexpected_server_error'),
          forbidden: this.t('error_forbidden'),
        },
      },
      units: {
        size: ['B', 'KB', 'MB', 'GB'],
        sizeBase: 1024,
      },
    };
  }

  private __handleUploadRequest(evt: CustomEvent<{ xhr: XMLHttpRequest; file: File }>) {
    evt.preventDefault();
    evt.detail.xhr.send(evt.detail.file);
  }

  private __handleFilesChanged(evt: CustomEvent) {
    if (this.__ignoreNextFilesChange) {
      this.__ignoreNextFilesChange = false;
      return;
    }

    const upload = evt.currentTarget as UploadElement;
    const nucleon = this.nucleon as DownloadableForm | null;

    const files = upload.files;
    if (files.length > 1) upload.files = [upload.files[0]];
    if (files[0]?.complete && !files[0].status) files[0].status = this.t('status_complete');
    nucleon?.edit({ file_name: upload.files[0]?.name ?? '' });
  }
}
