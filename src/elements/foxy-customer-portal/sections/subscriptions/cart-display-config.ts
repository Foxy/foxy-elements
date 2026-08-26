/**
 * The subscription and product-related flags off `cart_display_config`, as the SDK
 * types it on `CustomerPortalSettings['props']` (not exported from any public
 * subpath, so declared here the same way `NextDateModificationRule` is in
 * `subscription-page.tsx`).
 *
 * Every field is optional, matching the runtime: a store on an older
 * template config, or a settings response still loading, may not carry this
 * object -- or this shape -- at all. Every reader defaults an absent flag to
 * `true`, per FX-275, so an older config never loses fields it never opted
 * out of.
 */
export type CartDisplayConfig = {
  show_sub_frequency?: boolean;
  show_sub_startdate?: boolean;
  show_sub_nextdate?: boolean;
  show_sub_enddate?: boolean;
  /** Item options: hidden entirely when false, and `hidden_product_options`
   *  names individual options to drop even when they are shown. */
  show_product_options?: boolean;
  hidden_product_options?: string[];
  show_product_weight?: boolean;
  show_product_code?: boolean;
};
