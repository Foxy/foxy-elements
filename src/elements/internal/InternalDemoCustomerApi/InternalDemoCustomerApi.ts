import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../../public/CustomerApi';
import { InternalDemoAPI } from './InternalDemoAPI';

export class InternalDemoCustomerApi extends CustomerApi {
  get api(): API {
    return new InternalDemoAPI(this) as API;
  }
}
