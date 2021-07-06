import { LitElement } from 'lit-element';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';

export class DialogWindow extends ThemeableMixin(ResponsiveMixin(LitElement)) {}
