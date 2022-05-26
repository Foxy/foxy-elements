import '../../public/Spinner/index';
import '../InternalCreateControl/index';
import '../InternalDeleteControl/index';
import './internal/InternalTimestampsControl/index';
import { InternalForm } from './InternalForm';

customElements.define('foxy-internal-form', InternalForm);

export { InternalForm };
