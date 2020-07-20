# An instant, simple donation form

You only need your Foxy Store Subdomain to start accepting
donations.

The simplest use case for this donation form is this:

```html
<foxy-donation storeSubdomain="MyStore" value="123"></foxy-donation>
```

By setting the value for the donation and the Foxy Store
Subdomain, your donation form is ready.

The form is way more powerful than that: you can display a
list of possible values for the donners to choose from, allow
them to leave a message and even to commit themselves to
recursive payments. All with incredible ease:

```html
<foxy-donation
    storeSubdomain="MyStore"
    valueOptions="[10, 20, 30]"
    askComment
    askRecurrence
</foxy-donation>
```
## Examples

You can see some usage examples in the `dev` folder of the project.

[Run a dev server](#dev-server) and navigate to `http://localhost:8080/src/elements/public/DonationForm/demo/index.html`.


# Development

This component relies on Vaadin components

https://github.com/vaadin/platform/releases/tag/14.3.0


## Setup

Install dependencies:

```bash
npm i
```

## Build

This sample uses the TypeScript compiler to produce JavaScript that runs in modern browsers.

To build the JavaScript version of your component:

```bash
npm run build
```

## Dev Server

To run the dev server and open the project in a new browser tab:

```bash
npm run start
```

