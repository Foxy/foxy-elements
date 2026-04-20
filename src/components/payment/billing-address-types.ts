export type PaymentMethodSelectorBillingField = {
  id: string;
  label: string;
  type: "text" | "tel" | "select";
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string }>;
};

export type PaymentMethodSelectorBillingAddress = {
  useDefaultShippingAddress?: "yes-by-default" | "no-by-default";
  fields: PaymentMethodSelectorBillingField[];
};
