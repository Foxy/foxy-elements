import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { Button } from "@foxy.io/design-system/button";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { QuantityControls } from "@foxy.io/design-system/quantity-controls";
import { Radio } from "@foxy.io/design-system/radio";
import { Select } from "@foxy.io/design-system/select";
import { cartUrl } from "@/lib/products/catalog";
import { format, messages, type MessageDescriptor } from "@/lib/products/messages";
import {
  hasOptionControls,
  productModifiers,
  productOptions,
  settleChoices,
  valueStates,
} from "@/lib/products/options";
import { formatPrice } from "@/lib/products/price";
import type { CatalogProduct, ProductModifier } from "@/lib/products/types";
import {
  cartFields,
  chosenProduct,
  invalidModifiers,
  livePrice,
  modifierAmount,
  type FormState,
} from "./utils";

const Form = styled.form`
  display: grid;
  gap: ${(p) => p.theme.tokens.space.lg};
  font: ${(p) => p.theme.tokens.font.body};
  color: ${(p) => p.theme.tokens.color.body};
`;

const Values = styled(Radio.Group)`
  display: flex;
  flex-wrap: wrap;
  gap: ${(p) => p.theme.tokens.space.sm} ${(p) => p.theme.tokens.space.lg};
`;

const Value = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.tokens.space.xs};
`;

const ValueLabel = styled(Radio.Label)<{ $soldOut: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${(p) => p.theme.tokens.space.xs};
  cursor: ${(p) => (p.$soldOut ? "not-allowed" : "pointer")};
  color: ${(p) => (p.$soldOut ? p.theme.tokens.color.faint : "inherit")};
  text-decoration: ${(p) => (p.$soldOut ? "line-through" : "none")};
`;

const Swatch = styled.span<{ $color?: string; $image?: string }>`
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  border-radius: ${(p) => p.theme.tokens.borderRadius.pill};
  border: ${(p) => p.theme.tokens.border.default};
  background: ${(p) => (p.$image ? `center / cover url("${p.$image}")` : p.$color)};
`;

const Price = styled.p`
  margin: 0;
  font: ${(p) => p.theme.tokens.font.h3};
  s {
    margin-inline-start: ${(p) => p.theme.tokens.space.sm};
    color: ${(p) => p.theme.tokens.color.secondary};
    font: ${(p) => p.theme.tokens.font.body};
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${(p) => p.theme.tokens.space.md};
`;

export interface ProductFormViewProps {
  product: CatalogProduct;
  store: string;
  locale: string;
  currency: string | null;
  initialChoices: Record<string, string>;
  showQuantity: boolean;
  label: string;
  /** Where the hidden cart form goes: the element itself, in light DOM. */
  lightDom: HTMLElement;
  /** Where popups go: inside the shadow root, so its styles reach them. */
  portalContainer: HTMLElement | null;
}

function initialState(product: CatalogProduct, choices: Record<string, string>): FormState {
  const variants = product._embedded?.variants ?? [];
  const optionControls = hasOptionControls(product);
  return {
    choices: optionControls ? settleChoices(product, choices) : {},
    variantSku:
      !optionControls && variants.length
        ? (variants.find((v) => v.is_in_stock) ?? variants[0]).sku
        : null,
    modifiers: Object.fromEntries(
      productModifiers(product)
        .filter((m) => m.type === "select" && !m.required && m.values?.length)
        .map((m) => [m.name, m.values![0].value]),
    ),
    quantity: 1,
  };
}

export function ProductFormView(props: ProductFormViewProps) {
  const { product, store, locale, currency } = props;
  const t = (descriptor: MessageDescriptor, values?: Record<string, string | number>) =>
    format(locale, descriptor, values);
  const money = (amount: number) => formatPrice(amount, currency, locale);

  const [state, setState] = useState(() => initialState(product, props.initialChoices));
  const [showErrors, setShowErrors] = useState(false);
  const cartForm = useRef<HTMLFormElement>(null);
  const id = useId();

  const options = useMemo(() => productOptions(product), [product]);
  const modifiers = productModifiers(product);
  const optionControls = hasOptionControls(product);
  const chosen = chosenProduct(product, state);
  const price = livePrice(product, state, currency);
  const invalid = invalidModifiers(product, state);
  const soldOut = !chosen || !chosen.is_in_stock;

  const choose = (name: string, value: string) =>
    setState((s) => ({ ...s, choices: settleChoices(product, { ...s.choices, [name]: value }) }));
  const setModifier = (name: string, value: string) =>
    setState((s) => ({ ...s, modifiers: { ...s.modifiers, [name]: value } }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (invalid.size) {
      setShowErrors(true);
      return;
    }
    // The submit event fires on the light-DOM form, so 2.0's handler on
    // body sees it; without 2.0, the browser posts it to the cart.
    cartForm.current?.requestSubmit();
  };

  const modifierLabel = (modifier: ProductModifier) => {
    const label = modifier.label || modifier.name;
    return modifier.required ? label : t(messages.optional, { label });
  };

  return (
    <>
      <Form onSubmit={onSubmit} noValidate part="form">
        {optionControls
          ? options.map((option, index) => {
              const states = valueStates(product, index, state.choices);
              return (
                <Field.Set key={option.name}>
                  <Field.Legend>{option.label}</Field.Legend>
                  <Values
                    value={state.choices[option.name] ?? null}
                    onValueChange={(value) => choose(option.name, String(value))}
                  >
                    {option.values
                      .filter((value) => states.get(value.value) !== "missing")
                      .map((value) => {
                        const valueId = `${id}-${option.name}-${value.value}`;
                        const isSoldOut = states.get(value.value) === "sold-out";
                        return (
                          <Value key={value.value}>
                            <Radio.Root id={valueId} value={value.value} disabled={isSoldOut}>
                              <Radio.Indicator />
                            </Radio.Root>
                            <ValueLabel htmlFor={valueId} $soldOut={isSoldOut}>
                              {value.color || value.image ? (
                                <Swatch $color={value.color} $image={value.image?.src} aria-hidden="true" />
                              ) : null}
                              {isSoldOut ? t(messages.valueSoldOut, { label: value.label }) : value.label}
                            </ValueLabel>
                          </Value>
                        );
                      })}
                  </Values>
                </Field.Set>
              );
            })
          : null}

        {!optionControls && product._embedded?.variants?.length ? (
          <Field.Root>
            <Field.Label htmlFor={`${id}-variant`}>{t(messages.variant)}</Field.Label>
            <Select.Root
              value={state.variantSku}
              onValueChange={(value) => setState((s) => ({ ...s, variantSku: value as string }))}
              items={product._embedded.variants.map((v) => ({
                value: v.sku,
                label: v.definition.name ?? v.display_name ?? v.sku,
              }))}
            >
              <Select.Trigger id={`${id}-variant`}>
                <Select.Value />
                <Select.Icon />
              </Select.Trigger>
              <Select.Portal container={props.portalContainer ?? undefined}>
                <Select.Positioner>
                  <Select.Popup>
                    <Select.List>
                      {product._embedded.variants.map((v) => {
                        const name = v.definition.name ?? v.display_name ?? v.sku;
                        return (
                          <Select.Item key={v.sku} value={v.sku} disabled={!v.is_in_stock}>
                            <Select.ItemText>
                              {v.is_in_stock ? name : t(messages.valueSoldOut, { label: name })}
                            </Select.ItemText>
                          </Select.Item>
                        );
                      })}
                    </Select.List>
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          </Field.Root>
        ) : null}

        {modifiers.map((modifier) => {
          const fieldId = `${id}-${modifier.name}`;
          const error = showErrors ? invalid.get(modifier.name) : undefined;
          const value = state.modifiers[modifier.name] ?? "";
          if (modifier.type === "text") {
            const amount = modifierAmount(modifier, "x", currency);
            return (
              <Field.Root key={modifier.name} invalid={Boolean(error)}>
                <Field.Label htmlFor={fieldId}>
                  {modifierLabel(modifier)}
                  {amount ? ` ${t(messages.modifierPrice, { price: money(amount) })}` : ""}
                </Field.Label>
                <Input
                  id={fieldId}
                  type="text"
                  value={value}
                  maxLength={modifier.max_length ?? 255}
                  required={modifier.required}
                  onChange={(event) => setModifier(modifier.name, event.target.value)}
                />
                {error ? (
                  <Field.Error match>
                    {error === "required"
                      ? t(messages.required)
                      : t(messages.tooLong, { max: modifier.max_length ?? 255 })}
                  </Field.Error>
                ) : null}
              </Field.Root>
            );
          }

          const items = [
            ...(modifier.required ? [] : [{ value: "", label: t(messages.noChoice) }]),
            ...(modifier.values ?? []).map((v) => {
              const amount = modifierAmount(modifier, v.value, currency);
              const label = v.label || v.value;
              return {
                value: v.value,
                label: amount ? `${label} ${t(messages.modifierPrice, { price: money(amount) })}` : label,
              };
            }),
          ];
          return (
            <Field.Root key={modifier.name} invalid={Boolean(error)}>
              <Field.Label htmlFor={fieldId}>{modifierLabel(modifier)}</Field.Label>
              <Select.Root
                value={value || (modifier.required ? null : "")}
                onValueChange={(next) => setModifier(modifier.name, String(next ?? ""))}
                items={items}
              >
                <Select.Trigger id={fieldId}>
                  <Select.Value placeholder={t(messages.choose)} />
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal container={props.portalContainer ?? undefined}>
                  <Select.Positioner>
                    <Select.Popup>
                      <Select.List>
                        {items.map((item) => (
                          <Select.Item key={item.value} value={item.value}>
                            <Select.ItemText>{item.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
              {error ? <Field.Error match>{t(messages.required)}</Field.Error> : null}
            </Field.Root>
          );
        })}

        <Price part="price" aria-live="polite">
          {price ? money(price.price) : t(messages.unavailable)}
          {price?.listPrice && price.listPrice > price.price ? (
            <s aria-label={t(messages.priceWas, { price: money(price.listPrice) })}>
              {money(price.listPrice)}
            </s>
          ) : null}
        </Price>

        <Actions>
          {props.showQuantity ? (
            <QuantityControls
              value={state.quantity}
              min={1}
              onChange={(quantity) => setState((s) => ({ ...s, quantity: Math.max(1, quantity) }))}
              inputLabel={t(messages.quantity)}
              increaseButtonLabel={t(messages.increase)}
              decreaseButtonLabel={t(messages.decrease)}
            />
          ) : null}
          <Button type="submit" disabled={soldOut} part="button">
            {soldOut ? t(messages.soldOut) : props.label || t(messages.addToCart)}
          </Button>
        </Actions>
      </Form>

      {createPortal(
        <form ref={cartForm} action={cartUrl(store)} method="post" hidden>
          {cartFields(product, state).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </form>,
        props.lightDom,
      )}
    </>
  );
}
