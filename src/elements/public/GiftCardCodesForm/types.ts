import { GiftCardCodesForm } from './GiftCardCodesForm';
import { Renderer } from '../../../mixins/configurable';

export type Data = {
  _links: { self: { href: string } };
  gift_card_codes: string[];
};

export type Templates = {
  'codes:before'?: Renderer<GiftCardCodesForm>;
  'codes:after'?: Renderer<GiftCardCodesForm>;
  'import:before'?: Renderer<GiftCardCodesForm>;
  'import:after'?: Renderer<GiftCardCodesForm>;
};
