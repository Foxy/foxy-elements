import Dexie from 'dexie';
import IDBExportImport from 'indexeddb-export-import';
import dump from './dump.json';

export class DemoDatabase extends Dexie {
  static async fill(db: IDBDatabase): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      IDBExportImport.clearDatabase(db, (err: unknown) => {
        if (err) return reject(err);
        IDBExportImport.importFromJsonString(db, JSON.stringify(dump), (err: unknown) => {
          return err ? reject(err) : resolve();
        });
      });
    });
  }

  carts: Dexie.Table<any, number>;

  customerAddresses: Dexie.Table<any, number>;

  customerAttributes: Dexie.Table<any, number>;

  customers: Dexie.Table<any, number>;

  errorEntries: Dexie.Table<any, number>;

  items: Dexie.Table<any, number>;

  paymentMethods: Dexie.Table<any, number>;

  stores: Dexie.Table<any, number>;

  subscriptions: Dexie.Table<any, number>;

  taxes: Dexie.Table<any, number>;

  transactions: Dexie.Table<any, number>;

  users: Dexie.Table<any, number>;

  constructor() {
    super('foxy_demo_db');

    this.version(1).stores({
      carts: '++id',
      customer_addresses: '++id,customer',
      customer_attributes: '++id,customer',
      customers: '++id,store',
      error_entries: '++id,store',
      items: '++id,cart,transaction',
      payment_methods: '++id,customer',
      stores: '++id',
      subscriptions: '++id,store,customer',
      taxes: '++id,store',
      transactions: '++id,store,customer,subscription',
      users: '++id,store',
    });

    this.carts = this.table('carts');
    this.customerAddresses = this.table('customer_addresses');
    this.customerAttributes = this.table('customer_attributes');
    this.customers = this.table('customers');
    this.errorEntries = this.table('error_entries');
    this.items = this.table('items');
    this.paymentMethods = this.table('payment_methods');
    this.stores = this.table('stores');
    this.subscriptions = this.table('subscriptions');
    this.taxes = this.table('taxes');
    this.transactions = this.table('transactions');
    this.users = this.table('users');
  }
}
