export * from "./foxy-ach-field";
export * from "./foxy-customer-portal";
export * from "./foxy-payment-card-field";
export * from "./foxy-payment-method-selector";

// foxy-side-cart-trigger is deliberately NOT re-exported here. Its module
// imports `@foxy.io/sdk/checkout/side-cart`, which installs the sidecart as
// `client`'s cart-mutation transport as an import side effect -- so anyone
// importing this barrel (or the aggregate `@foxy.io/elements` package it
// builds) would silently route every cart mutation through a sidecart
// iframe, whether or not a trigger is anywhere on the page. Import it from
// its own subpath (`@foxy.io/elements/foxy-side-cart-trigger`) instead --
// that stays the supported way to use it.
