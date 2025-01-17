import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

const NS = 'email-template-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing email templates (`fx:email_template`).
 *
 * @element foxy-email-template-form
 * @since 1.14.0
 */
export class EmailTemplateForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultSubject: { attribute: 'default-subject' },
    };
  }

  /** Default email subject. Use this instead of i18next key when you need to use handlebars syntax. */
  defaultSubject: string | null = null;

  private readonly __templateLanguageOptions = [
    { rawLabel: 'Nunjucks', value: 'nunjucks' },
    { rawLabel: 'Handlebars', value: 'handlebars' },
    { rawLabel: 'Pug', value: 'pug' },
    { rawLabel: 'Twig', value: 'twig' },
    { rawLabel: 'EJS', value: 'ejs' },
  ];

  private readonly __toggleGetValue = () => !!this.form.subject;

  private readonly __toggleSetValue = (newValue: boolean) => {
    if (newValue) {
      this.edit({ subject: this.defaultSubject ?? this.t('general.subject.default_value') });
    } else {
      this.edit({ subject: '' });
    }
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    const subject = this.form.subject;

    if (this.form.content_html_url && subject) alwaysMatch.unshift('content-html');
    if (this.form.content_text_url && subject) alwaysMatch.unshift('content-text');

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get disabledSelector(): BooleanSelector {
    const alwaysMatch = [super.disabledSelector.toString()];

    if (
      !this.in({ idle: { snapshot: 'clean' } }) ||
      !this.data.content_html_url ||
      !this.data.content_text_url
    ) {
      alwaysMatch.unshift('html-source:cache', 'text-source:cache');
    }

    if (!this.form.subject) {
      alwaysMatch.unshift(
        'general:template-language',
        'html-source',
        'text-source',
        'content-html',
        'content-text'
      );
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (!this.data?.content_html_url) alwaysMatch.unshift('html-source:cache');
    if (!this.data?.content_text_url) alwaysMatch.unshift('text-source:cache');
    if (!this.data?.subject && !this.form.subject) {
      alwaysMatch.unshift(
        'general:template-language',
        'general:subject',
        'html-source',
        'text-source',
        'content-html',
        'content-text'
      );
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="description">
        </foxy-internal-text-control>

        <foxy-internal-switch-control
          infer="toggle"
          .getValue=${this.__toggleGetValue}
          .setValue=${this.__toggleSetValue}
        >
        </foxy-internal-switch-control>

        <foxy-internal-text-control layout="summary-item" infer="subject">
        </foxy-internal-text-control>

        <foxy-internal-select-control
          layout="summary-item"
          infer="template-language"
          .options=${this.__templateLanguageOptions}
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      ${this.renderTemplateOrSlot()}

      <foxy-internal-source-control infer="content-html"></foxy-internal-source-control>

      <foxy-internal-summary-control infer="html-source">
        <foxy-internal-text-control layout="summary-item" infer="content-html-url">
        </foxy-internal-text-control>
        <foxy-internal-email-template-form-async-action
          theme="tertiary-inline"
          infer="cache"
          href=${ifDefined(this.data?._links['fx:cache'].href)}
        >
        </foxy-internal-email-template-form-async-action>
      </foxy-internal-summary-control>

      <foxy-internal-source-control infer="content-text"></foxy-internal-source-control>

      <foxy-internal-summary-control infer="text-source">
        <foxy-internal-text-control layout="summary-item" infer="content-text-url">
        </foxy-internal-text-control>
        <foxy-internal-email-template-form-async-action
          theme="tertiary-inline"
          infer="cache"
          href=${ifDefined(this.data?._links['fx:cache'].href)}
        >
        </foxy-internal-email-template-form-async-action>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPost(edits);

    if (edits.content_html_url && edits.content_text_url) {
      const url = data._links['fx:cache'].href;
      const response = await new EmailTemplateForm.API(this).fetch(url, { method: 'POST' });
      if (!response.ok) throw ['error:failed_to_cache'];
    }

    return await this._fetch(data._links.self.href);
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPatch(edits);
    if (!edits.content_html_url && !edits.content_text_url) return data;

    const url = data._links['fx:cache'].href;
    const response = await new EmailTemplateForm.API(this).fetch(url, { method: 'POST' });
    if (!response.ok) throw ['error:failed_to_cache'];

    return await this._fetch(data._links.self.href);
  }
}
