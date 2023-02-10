import '@vaadin/vaadin-tabs';

import '../NucleonElement/index';
import '../Spinner/index';
import '../I18n/index';

import './internal/InternalI18nEditorEntry/index';

import { I18nEditor } from './I18nEditor';

customElements.define('foxy-i18n-editor', I18nEditor);

export { I18nEditor };
