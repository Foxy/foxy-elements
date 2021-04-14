import * as FoxySDK from '@foxy.io/sdk';

import { AddressForm } from '../AddressForm/AddressForm';
import { AttributeForm } from '../AttributeForm/AttributeForm';
import { CustomerForm } from '../CustomerForm/CustomerForm';
import { PaymentMethodCard } from '../PaymentMethodCard/PaymentMethodCard';
import { SubscriptionForm } from '../SubscriptionForm/SubscriptionForm';

export type Rel = FoxySDK.Backend.Rels.Customer;
export type Data = FoxySDK.Core.Resource<Rel, undefined>;

export type Field =
  | 'paymentMethodCard'
  | 'subscriptionForm'
  | 'attributeForm'
  | 'customerForm'
  | 'addressForm';

export type Control = Field | 'createAttributeButton' | 'createAddressButton' | 'editButton';

export type Section =
  | Control
  | 'subscriptions'
  | 'transactions'
  | 'attributes'
  | 'addresses'
  | 'header';

export type ReadonlyValue =
  | boolean
  | {
      not?: Field[];
      only?: {
        paymentMethodCard?: PaymentMethodCard['readonly'];
        subscriptionForm?: SubscriptionForm['readonly'];
        attributeForm?: AttributeForm['readonly'];
        customerForm?: CustomerForm['readonly'];
        addressForm?: AddressForm['readonly'];
      };
    };

export type DisabledValue =
  | boolean
  | {
      not?: Control[];
      only?: {
        paymentMethodCard?: PaymentMethodCard['disabled'];
        subscriptionForm?: SubscriptionForm['disabled'];
        attributeForm?: AttributeForm['disabled'];
        customerForm?: CustomerForm['disabled'];
        addressForm?: AddressForm['disabled'];

        createAttributeButton?: boolean;
        createAddressButton?: boolean;
        editButton?: boolean;
      };
    };

export type ExcludedValue =
  | boolean
  | {
      not?: Exclude<Control, 'paymentMethodCard'>[];
      only?: {
        paymentMethodCard?: boolean;
        subscriptionForm?: SubscriptionForm['excluded'];
        attributeForm?: AttributeForm['excluded'];
        customerForm?: CustomerForm['excluded'];
        addressForm?: AddressForm['excluded'];

        createAttributeButton?: boolean;
        createAddressButton?: boolean;
        editButton?: boolean;

        subscriptions?: boolean;
        transactions?: boolean;
        attributes?: boolean;
        addresses?: boolean;
        header?: boolean;
      };
    };
