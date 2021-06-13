import { Data } from './types';
import { NucleonElement } from '../NucleonElement';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult } from 'lit-element';
import { html } from 'lit-html';

export class TaxForm extends ScopedElementsMixin(NucleonElement)<Data> {
  render(): TemplateResult {
    return html``;
  }
}
