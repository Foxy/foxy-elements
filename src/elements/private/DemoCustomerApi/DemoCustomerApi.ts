import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../../public/CustomerApi';
import { DemoAPI } from './DemoAPI';

export class DemoCustomerApi extends CustomerApi {
  get api(): API {
    return new DemoAPI(this) as API;
  }
}
