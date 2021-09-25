import './index';
import { elementUpdated, expect, fixture, html, waitUntil } from '@open-wc/testing';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TemplateForm } from './TemplateForm';
import { TemplateResult } from 'lit-element';
import { router } from '../../../server';

const emailTemplateUrl = 'https://demo.foxycart.com/s/admin/email_templates/0';
const cartTemplateUrl = 'https://demo.foxycart.com/s/admin/template/cart_templates/0';

/**
 * Creates a foxy-template-form TemplateResult for the resource from the given
 * API endpoint.
 *
 * @param href of the API endpoint
 * @returns template
 */
function templateFormEl(href: string): TemplateResult {
  return html`
    <foxy-template-form @fetch=${(evt: FetchEvent) => router.handleEvent(evt)} href="${href}">
    </foxy-template-form>
  `;
}

/**
 * @param el
 * @param contentType
 * @param value
 */
async function selectTemplateConfig(
  el: TemplateForm,
  contentType: 'html' | 'text' | '',
  value: 'default' | 'url' | 'clipboard'
) {
  const tabs = el.shadowRoot?.querySelector('[data-testid="tabs"]');
  if (contentType == 'html') {
    expect(tabs).to.exist;
    (tabs as any).value = 0;
  } else if (contentType == 'text') {
    expect(tabs).to.exist;
    (tabs as any).value = 1;
  }
  await elementUpdated(el);
  const choiceEl = el.shadowRoot?.querySelector(
    `[data-testid="template-type${contentType ? '-' + contentType : ''}"]`
  );
  expect(choiceEl).to.exist;
  if (choiceEl) (choiceEl as any).value = value;
}

/**
 * @param field
 */
function extractType(
  field: 'content_html_url' | 'content_text_url' | 'content_url' | 'content'
): 'html' | 'text' | '' {
  switch (field) {
    case 'content_html_url':
      return 'html';
    case 'content_text_url':
      return 'text';
    case 'content_url':
      return '';
    case 'content':
      return '';
  }
  return '';
}

it('Validates long url fields in email', async function () {
  const el: TemplateForm = await fixture(templateFormEl(emailTemplateUrl));
  await waitUntil(() => el.in('idle'), 'Element should become idle');
  el.edit({ content_text_url: `http://demo.${Array(300).join('a')}.com/my_template` });
  await elementUpdated(el);
  const choice = el.shadowRoot?.querySelector(`[data-testid="template-type-text"]`);
  expect(choice, `testid template-type-text does not exist.`).to.exist;
  const error = choice?.getAttribute('error-message');
  expect(error).to.equal('v8n_too_long');
});

describe('Input Validation', function () {
  interface inputChanges {
    changes: any;
    field: string;
    href: string;
    message: string;
    rule: string;
  }

  /**
   * Creates an object to edit the elements form, triggering field to enter
   * invalid state due to its length.
   *
   * @param field to create the params for.
   * @param url the href url to use, this allows testing for components using
   * email templates
   * @returns inputChanges
   */
  function longURL(field: string, url: string): inputChanges {
    const params = {
      changes: {},
      field,
      href: url,
      message: 'v8n_too_long',
      output: `${field}_too_long`,
      rule: 'must have fewer than 300 characters',
    };
    (params.changes as any)[field] = `http://demo.${Array(300).join('a')}.com/my_template`;
    return params;
  }

  /**
   * Creates an object to edit the elements form, triggering field to enter
   * invalid state due to URL invalid format.
   *
   * @param field to create the params for.
   * @param url the href url to use, this allows testing for components using
   * email templates
   * @returns inputChanges
   */
  function invalidURL(field: string, url: string): inputChanges {
    const params = {
      changes: {},
      field,
      href: url,
      message: 'v8n_invalid',
      output: `${field}_invalid`,
      rule: 'must be a URL',
    };
    (params.changes as any)[field] = `http/not a URL!!`;
    return params;
  }

  const cases = [
    longURL('content_url', cartTemplateUrl),
    longURL('content_text_url', emailTemplateUrl),
    longURL('content_html_url', emailTemplateUrl),
    invalidURL('content_url', cartTemplateUrl),
    invalidURL('content_text_url', emailTemplateUrl),
    invalidURL('content_html_url', emailTemplateUrl),
  ];
  for (const c of cases) {
    let contentType = '';
    switch (c.field) {
      case 'content_url':
        contentType = '';
        break;
      default:
        contentType = c.field.replace(/[^_]*_([^_]*)_.*/, '-$1');
    }
    it(`Validates ${contentType ? '' : 'non-'}emailTemplate ${c.field} to ${
      c.rule
    }`, async function () {
      const el: TemplateForm = await fixture(templateFormEl(c.href));
      await waitUntil(() => el.in('idle'), 'Element should become idle');
      el.edit(c.changes);
      await elementUpdated(el);
      const choice = el.shadowRoot?.querySelector(`[data-testid="template-type${contentType}"]`);
      expect(choice, `testid template-type${contentType} does not exist. ${c.href}`).to.exist;
      const error = choice?.getAttribute('error-message');
      expect(error).to.equal(c.message);
    });
  }
});

describe('Usability', function () {
  describe('Should hide unused elements', async function () {
    const versions = {
      mailHtml: { fields: ['content_html_url', 'content_html'], href: emailTemplateUrl },
      mailText: { fields: ['content_text_url', 'content_text'], href: emailTemplateUrl },
      notMail: { fields: ['content_url', 'content'], href: cartTemplateUrl },
    };
    const options = {
      clipboard: [false, true],
      default: [false, false],
      url: [true, false],
    };
    for (const [k, v] of Object.entries(versions)) {
      for (const [option, rules] of Object.entries(options)) {
        it(`Should hide unused fields for ${k} option ${option}`, async function () {
          const el: TemplateForm = await fixture(templateFormEl(v.href));
          await waitUntil(() => el.in('idle'), 'Element should become idle');
          await selectTemplateConfig(
            el,
            extractType(v.fields[0] as 'content_html_url' | 'content_text_url' | 'content_url'),
            option as keyof typeof options
          );
          for (let i = 0; i < 2; i++) {
            const fieldEl: HTMLElement | undefined | null = el.shadowRoot?.querySelector(
              `[data-testid="${v.fields[i]}"]`
            );
            expect(fieldEl, `data-testid=${v.fields[i]} should exist`).to.exist;
            if (fieldEl) {
              if (rules[i]) {
                expect(
                  fieldEl.offsetParent,
                  `${v.fields[i]} should be visible when option ${option}`
                ).to.exist;
              } else {
                expect(
                  fieldEl.offsetParent,
                  `${v.fields[i]} should be hidden when option ${option}`
                ).to.be.null;
              }
            }
          }
        });
      }
    }
  });

  it('Should should display overview of the possible configurations');
  it('Should should display overview of the possible configurations');
  it('Should detect it is an email template based on the href attribute');
});

describe('Email template', function () {
  it('Should provide options for HTML and pure text emails.');
  it('HTML email should be the default.');
});

describe('Cache', function () {
  it('Should provide a feature for caching the contents from provided URL');
});
