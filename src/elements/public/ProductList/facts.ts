const wikipedia = (page: string) => ({
  source: 'Wikipedia',
  href: `https://en.wikipedia.org/wiki/${page}`,
});

/** Where each fact about the history of commerce comes from. Its text is `fact_<id>` in the translations. */
export const FACTS: { id: string; source: string; href: string }[] = [
  { id: 'ea_nasir', ...wikipedia('Complaint_tablet_to_Ea-n%C4%81%E1%B9%A3ir') },
  { id: 'needle_shop', ...wikipedia('History_of_advertising') },
  { id: 'hopewell', ...wikipedia('Hopewell_tradition') },
  { id: 'chaco_cacao', ...wikipedia('Pueblo_Bonito') },
  { id: 'pochteca', ...wikipedia('Pochteca') },
  { id: 'kultepe', ...wikipedia('K%C3%BCltepe') },
  { id: 'cowry', ...wikipedia('Shell_money') },
  { id: 'vending', ...wikipedia('Vending_machine') },
  { id: 'trajan', ...wikipedia('Trajan%27s_Market') },
  { id: 'wedgwood', ...wikipedia('Josiah_Wedgwood') },
  { id: 'mail_order', ...wikipedia('Pryce_Pryce-Jones') },
  { id: 'price_tag', ...wikipedia('John_Wanamaker') },
  { id: 'trade_mark', ...wikipedia('Bass_Brewery') },
  { id: 'cash_register', ...wikipedia('Cash_register') },
  { id: 'shopping_cart', ...wikipedia('Shopping_cart') },
  { id: 'barcode', ...wikipedia('Universal_Product_Code') },
  { id: 'first_web_sale', ...wikipedia('Online_shopping') },
];
