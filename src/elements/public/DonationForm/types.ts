import { TemplateResult } from 'lit-element';

export interface DonationFormField {
  name: string;
  weight: () => number;
  template: TemplateResult;
  condition: () => boolean;
}
