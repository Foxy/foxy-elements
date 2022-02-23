import { Renderer } from '../../../mixins/configurable';
import { GiftCardCodeForm } from './GiftCardCodeForm';

export type Data = {
  _links: {
    'curies': [{ href: string }];
    'self': { href: string };
    'fx:store': { href: string };
    'fx:gift_card': { href: string };
    'fx:gift_card_code_logs': { href: string };
  };
  code: string;
  current_balance: number;
  end_date: string | null;
  date_created: string | null;
  date_modified: string | null;
};

export type Templates = {
  'code:before'?: Renderer<GiftCardCodeForm>;
  'code:after'?: Renderer<GiftCardCodeForm>;
  'current-balance:before'?: Renderer<GiftCardCodeForm>;
  'current-balance:after'?: Renderer<GiftCardCodeForm>;
  'end-date:before'?: Renderer<GiftCardCodeForm>;
  'end-date:after'?: Renderer<GiftCardCodeForm>;
  'timestamps:before'?: Renderer<GiftCardCodeForm>;
  'timestamps:after'?: Renderer<GiftCardCodeForm>;
  'delete:before'?: Renderer<GiftCardCodeForm>;
  'delete:after'?: Renderer<GiftCardCodeForm>;
  'create:before'?: Renderer<GiftCardCodeForm>;
  'create:after'?: Renderer<GiftCardCodeForm>;
};
