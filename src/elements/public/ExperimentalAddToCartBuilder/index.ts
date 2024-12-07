import '@vaadin/vaadin-button';

import '../../internal/InternalResourcePickerControl/index';
import '../../internal/InternalSummaryControl/index';
import '../../internal/InternalSwitchControl/index';
import '../../internal/InternalSelectControl/index';
import '../../internal/InternalForm/index';

import '../TemplateSetCard/index';
import '../CopyToClipboard/index';
import '../NucleonElement/index';
import '../Spinner/index';
import '../I18n/index';

import './internal/InternalExperimentalAddToCartBuilderItemControl/index';

import { ExperimentalAddToCartBuilder } from './ExperimentalAddToCartBuilder';

customElements.define('foxy-experimental-add-to-cart-builder', ExperimentalAddToCartBuilder);

export { ExperimentalAddToCartBuilder };
