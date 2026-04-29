import type { Dispatch, SetStateAction } from "react";
import type { MessageDescriptor, IntlShape } from "react-intl";
import type {
  PaymentMethodSelectorBillingAddress,
  PaymentMethodSelectorBillingField,
  PaymentMethodSelectorOption,
} from "./types";

import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BILLING_ADDRESS_SUPPORTED_TYPES = new Set([
  "new-card",
  "saved-card",
  "stripe-card-element",
  "stripe-payment-element",
]);

type BillingSectionMessages = {
  billingAddressTitle: MessageDescriptor;
  addBillingAddress: MessageDescriptor;
  useShippingForBilling: MessageDescriptor;
  selectPlaceholder: MessageDescriptor;
};

function buildInitialBillingValues(
  billingAddress: PaymentMethodSelectorBillingAddress | undefined,
) {
  return Object.fromEntries(
    (billingAddress?.fields ?? []).map((field) => [
      field.id,
      field.value ?? "",
    ]),
  );
}

function getBillingSummaryLines(values: Record<string, string>) {
  const name = [values["billing-first-name"], values["billing-last-name"]]
    .filter(Boolean)
    .join(" ");
  const company = values["billing-company"];
  const address1 = values["billing-address1"];
  const address2 = values["billing-address2"];
  const cityLine = [
    values["billing-city"],
    values["billing-region"],
    values["billing-postal-code"],
    values["billing-country"],
  ]
    .filter(Boolean)
    .join(", ");
  const phone = values["billing-phone"];

  return [name, company, address1, address2, cityLine, phone].filter(Boolean);
}

function renderBillingField(
  field: PaymentMethodSelectorBillingField,
  disabled: boolean,
  values: Record<string, string>,
  setValues: Dispatch<SetStateAction<Record<string, string>>>,
  intl: IntlShape,
  selectPlaceholder: MessageDescriptor,
) {
  const value = values[field.id] ?? "";
  const fieldDisabled = disabled || Boolean(field.disabled);

  if (field.type === "select") {
    return (
      <Select
        value={value}
        disabled={fieldDisabled}
        onValueChange={(nextValue) => {
          setValues((prev) => ({ ...prev, [field.id]: nextValue ?? "" }));
        }}
      >
        <SelectTrigger id={field.id} className="w-full">
          <SelectValue placeholder={intl.formatMessage(selectPlaceholder)} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={field.type === "tel" ? "tel" : "text"}
      value={value}
      placeholder={field.placeholder}
      disabled={fieldDisabled}
      required={field.required}
      onChange={(event) => {
        const nextValue = event.target.value;
        setValues((prev) => ({ ...prev, [field.id]: nextValue }));
      }}
    />
  );
}

export function BillingAddressSection({
  option,
  disabled,
  billingAddress,
  onBillingAddressChange,
  fieldLabelById,
  messages,
}: {
  option: PaymentMethodSelectorOption;
  disabled?: boolean;
  billingAddress?: PaymentMethodSelectorBillingAddress;
  onBillingAddressChange?: (params: {
    optionId: string;
    useShippingAddress: boolean;
    values: Record<string, string>;
  }) => void;
  fieldLabelById: Partial<Record<string, MessageDescriptor>>;
  messages: BillingSectionMessages;
}) {
  const intl = useIntl();
  const [useShippingAddress, setUseShippingAddress] = useState(
    billingAddress?.useDefaultShippingAddress === "yes-by-default",
  );
  const [showSummaryEditor, setShowSummaryEditor] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialBillingValues(billingAddress),
  );

  const supportsBillingAddress = option.type
    ? BILLING_ADDRESS_SUPPORTED_TYPES.has(option.type)
    : false;

  useEffect(() => {
    setUseShippingAddress(
      billingAddress?.useDefaultShippingAddress === "yes-by-default",
    );
    setShowSummaryEditor(false);
    setValues(buildInitialBillingValues(billingAddress));
  }, [billingAddress, option.id]);

  useEffect(() => {
    if (!supportsBillingAddress || !billingAddress) return;

    onBillingAddressChange?.({
      optionId: option.id,
      useShippingAddress,
      values,
    });
  }, [
    billingAddress,
    onBillingAddressChange,
    option.id,
    supportsBillingAddress,
    useShippingAddress,
    values,
  ]);

  if (
    !billingAddress ||
    !supportsBillingAddress ||
    !billingAddress.fields.length
  ) {
    return null;
  }

  const fieldsMarkup = (
    <FieldSet>
      <FieldGroup>
        {billingAddress.fields.map((field) => {
          const labelDescriptor = fieldLabelById[field.id];
          const label = labelDescriptor
            ? intl.formatMessage(labelDescriptor)
            : field.label;

          return (
            <Field key={field.id}>
              <FieldLabel htmlFor={field.id}>{label}</FieldLabel>
              {renderBillingField(
                field,
                Boolean(disabled),
                values,
                setValues,
                intl,
                messages.selectPlaceholder,
              )}
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );

  if (option.type === "saved-card") {
    if (showSummaryEditor) {
      return fieldsMarkup;
    }

    const summaryLines = getBillingSummaryLines(values);
    return (
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setShowSummaryEditor(true)}
        className="h-auto w-full items-start justify-start px-3 py-3 text-left"
      >
        <span className="flex flex-col gap-1">
          <span className="font-semibold">
            {intl.formatMessage(messages.billingAddressTitle)}
          </span>
          {summaryLines.length ? (
            summaryLines.map((line) => (
              <span key={line} className="text-sm text-muted-foreground">
                {line}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              {intl.formatMessage(messages.addBillingAddress)}
            </span>
          )}
        </span>
      </Button>
    );
  }

  const hasShippingToggle = Boolean(billingAddress.useDefaultShippingAddress);

  return (
    <div className="flex flex-col gap-2.5">
      {hasShippingToggle ? (
        <Field orientation="horizontal">
          <Checkbox
            id={`use-shipping-address-${option.id}`}
            checked={useShippingAddress}
            disabled={disabled}
            onCheckedChange={(checked) =>
              setUseShippingAddress(Boolean(checked))
            }
            aria-label={intl.formatMessage(messages.useShippingForBilling)}
          />
          <FieldLabel htmlFor={`use-shipping-address-${option.id}`}>
            {intl.formatMessage(messages.useShippingForBilling)}
          </FieldLabel>
        </Field>
      ) : null}

      {(!hasShippingToggle || !useShippingAddress) && fieldsMarkup}
    </div>
  );
}