import { ErrorScreen, Choice, Dropdown, Checkbox } from '../../../private/index';

export interface Refs {
  error?: ErrorScreen;
  form?: HTMLFormElement;
  amount?: Choice;
  designation?: Choice;
  comment?: HTMLInputElement;
  submit?: HTMLButtonElement;
  frequency?: Dropdown;
  anonymity?: Checkbox;
}
