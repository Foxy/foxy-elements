import { endpoint } from '..';
import halson from 'halson';

export function composeDiscount(doc: any) {
  const { id, store, coupon, customer, coupon_code, transaction, ...publicData } = doc;

  return halson(publicData)
    .addLink('self', `${endpoint}/applied_taxes/${id}`)
    .addLink('fx:store', `${endpoint}/stores/${store}`)
    .addLink('fx:coupon', `${endpoint}/coupons/${coupon}`)
    .addLink('fx:customer', `${endpoint}/customers/${customer}`)
    .addLink('fx:coupon_code', `${endpoint}/coupon_codes/${coupon_code}`)
    .addLink('fx:transaction', `${endpoint}/transactions/${transaction}`);
}
