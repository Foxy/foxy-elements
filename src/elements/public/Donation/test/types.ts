import { Checkbox, Choice, Dropdown, ErrorScreen } from '../../../private';

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
