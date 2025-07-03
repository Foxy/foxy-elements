import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../index';
import './index';

import { InternalDownloadableFormUploadControl as Control } from './InternalDownloadableFormUploadControl';
import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { createRouter } from '../../../../../server/hapi/index';
import { DownloadableForm } from '../../DownloadableForm';
import { stub } from 'sinon';

describe('InternalDownloadableFormUploadControl', () => {
  it('imports and defines foxy-internal-control', () => {
    expect(customElements.get('foxy-internal-control')).to.exist;
  });

  it('imports and defines vaadin-upload', () => {
    expect(customElements.get('vaadin-upload')).to.exist;
  });

  it('imports and defines foxy-i18n', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines itself as foxy-internal-downloadable-form-upload-control', () => {
    expect(customElements.get('foxy-internal-downloadable-form-upload-control')).to.equal(Control);
  });

  it('extends foxy-internal-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-control'));
  });

  it('renders vaadin-upload for file selection and display', async () => {
    const control = await fixture<Control>(
      html`<foxy-internal-downloadable-form-upload-control></foxy-internal-downloadable-form-upload-control>`
    );

    const upload = control.uploadElement;

    expect(upload).to.be.instanceOf(customElements.get('vaadin-upload'));

    expect(upload).to.have.attribute('max-file-size', '524288000');
    expect(upload).to.have.attribute('max-files', '2');
    expect(upload).to.not.have.attribute('disabled');
    expect(upload).to.not.have.attribute('readonly');
    expect(upload).to.have.attribute('no-auto');
    expect(upload).to.have.attribute('method', 'PUT');

    expect(upload).to.have.deep.property('i18n', {
      dropFiles: { one: 'drop_label', many: 'drop_label' },
      addFiles: { one: 'select_label', many: 'select_label' },
      cancel: 'cancel',
      units: { size: ['B', 'KB', 'MB', 'GB'], sizeBase: 1024 },
      error: {
        tooManyFiles: 'error_too_many_files',
        fileIsTooBig: 'error_too_big',
        incorrectFileType: '',
      },
      uploading: {
        status: {
          connecting: 'status_connecting',
          stalled: 'status_stalled',
          processing: 'status_processing',
          held: 'status_held',
        },
        remainingTime: { prefix: 'remaining_prefix', unknown: 'remaining_unknown' },
        error: {
          serverUnavailable: 'error_server_unavailable',
          unexpectedServerError: 'error_unexpected_server_error',
          forbidden: 'error_forbidden',
        },
      },
    });
  });

  it('disables vaadin-upload when the control is disabled', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-downloadable-form-upload-control disabled>
      </foxy-internal-downloadable-form-upload-control>
    `);

    const upload = control.uploadElement;

    expect(upload).to.have.attribute('max-files', '0');
    expect(upload).to.have.attribute('disabled');
  });

  it('makes vaadin-upload readonly when the control is readonly', async () => {
    const control = await fixture<Control>(html`
      <foxy-internal-downloadable-form-upload-control readonly>
      </foxy-internal-downloadable-form-upload-control>
    `);

    const upload = control.uploadElement;

    expect(upload).to.have.attribute('max-files', '0');
    expect(upload).to.have.attribute('readonly');
  });

  it('uploads selected file after form POST', async () => {
    const router = createRouter();
    const element = await fixture<DownloadableForm>(html`
      <foxy-downloadable-form
        parent="https://demo.api/hapi/downloadables"
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url.endsWith('/create_upload_url')) {
            evt.preventDefault();
            evt.respondWith(
              Promise.resolve(
                new Response(
                  JSON.stringify({
                    upload_url: 'https://demo.api/virtual/empty',
                  })
                )
              )
            );
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-downloadable-form>
    `);

    element.edit({
      item_category_uri: 'https://demo.api/hapi/item_categories/0',
      item_category_id: 0,
      file_name: 'test_file.txt',
      price: 50,
      name: 'Test',
      code: 'TEST',
    });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<Control>('[infer="upload"]')!;
    const upload = control.uploadElement!;

    upload.files = [
      // @ts-expect-error this is ok according to vaadin docs
      {
        complete: false,
        progress: 0,
        status: 'status_pending',
        name: 'test_file.txt',
      },
    ];

    const uploadFilesMethod = stub(upload, 'uploadFiles');

    element.submit();
    await waitUntil(() => !!upload.files[0].uploadTarget, '', { timeout: 5000 });

    expect(upload.files[0].uploadTarget).to.equal('https://demo.api/virtual/empty');
    expect(uploadFilesMethod).to.have.been.called;
  });

  it('uploads selected file after form PATCH', async () => {
    const router = createRouter();
    const element = await fixture<DownloadableForm>(html`
      <foxy-downloadable-form
        href="https://demo.api/hapi/downloadables/0"
        @fetch=${(evt: FetchEvent) => {
          if (evt.request.url.endsWith('/create_upload_url')) {
            evt.preventDefault();
            evt.respondWith(
              Promise.resolve(
                new Response(
                  JSON.stringify({
                    upload_url: 'https://demo.api/virtual/empty',
                  })
                )
              )
            );
          } else {
            router.handleEvent(evt);
          }
        }}
      >
      </foxy-downloadable-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    element.edit({ file_name: 'test_file_2.txt' });

    await element.requestUpdate();
    const control = element.renderRoot.querySelector<Control>('[infer="upload"]')!;
    const upload = control.uploadElement!;

    upload.files = [
      // @ts-expect-error this is ok according to vaadin docs
      {
        complete: false,
        progress: 0,
        status: 'status_pending',
        name: 'test_file_2.txt',
      },
    ];

    const uploadFilesMethod = stub(upload, 'uploadFiles');

    element.submit();
    await waitUntil(() => !!upload.files[0].uploadTarget, '', { timeout: 5000 });

    expect(upload.files[0].uploadTarget).to.equal('https://demo.api/virtual/empty');
    expect(uploadFilesMethod).to.have.been.called;
  });

  it('displays uploaded file from the form', async () => {
    const router = createRouter();

    const element = await fixture<DownloadableForm>(html`
      <foxy-downloadable-form
        downloadable-item-categories="https://demo.api/hapi/item_categories"
        href="https://demo.api/hapi/downloadables/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-downloadable-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<Control>('[infer="upload"]');

    await control?.requestUpdate();
    const upload = control?.uploadElement;

    expect(upload).to.have.nested.property('files[0].complete', true);
    expect(upload).to.have.nested.property('files[0].progress', 100);
    expect(upload).to.have.nested.property('files[0].status', 'status_complete');
    expect(upload).to.have.nested.property('files[0].name', element.data?.file_name);
  });
});
