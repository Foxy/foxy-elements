import { Renderer } from '../../../mixins/configurable';
import { GiftCardCard } from './GiftCardCard';

export type Data = {
  _links: {
    'curies': [{ href: string }];
    'self': { href: string };
    'fx:store': { href: string };
    'fx:generate_codes': { href: string };
    'fx:gift_card_codes': { href: string };
    'fx:gift_card_item_categories': { href: string };
  };
  name: string;
  currency_code: string;
  expires_after: string;
  product_code_restrictions: string | null;
  date_created: string | null;
  date_modified: string | null;
};

export type Templates = Partial<{
  'title:before': Renderer<GiftCardCard>;
  'title:after': Renderer<GiftCardCard>;
  'status:before': Renderer<GiftCardCard>;
  'status:after': Renderer<GiftCardCard>;
}>;
