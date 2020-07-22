# Donation form: an instant, simple donation web-component form

## Overview

Donation Form is a customizable web component that provides a form to accept donations.

In it's most basic implementation it simply accepts a donation of a given value, but it can be expanded to include custom donation values, recurring donations, designation choices, comments and anonymous donations.

You'll need your Foxy Store Subdomain to accept donations. Other than that you can customize your form however you want.

## Quick examples

You only need your Foxy Store Subdomain to start accepting donations.

The simplest use case for this donation form is this:

```html
<foxy-donation storeSubdomain="MyStore" value="123"></foxy-donation>
```

By setting the value for the donation and the Foxy Store Subdomain, your donation form is ready.

The form is way more powerful than that: you can display a list of possible values for the donners to choose from, allow them to leave a message and even to commit themselves to recursive payments. All with incredible ease:

```html
<foxy-donation
    storeSubdomain="MyStore"
    valueOptions="[10, 20, 30]"
    askComment
    askRecurrence
    >
</foxy-donation>
```
## Configuration Summary

This summary is meant to be used as a reference. You'll find detailed explanations bellow the table.

### Attributes

| Attribute   | Default Value | Descripiton | Required |
| ----------- | ----------- |-------------|------------|
|storeSubdomain | - | Your Foxy Store Subdomain| Yes |
|name | 'FOXYDONATIONFORM'|The product name. This should be a name your user will clearly identify in the cart.| |
|code | '' | A unique identification of this particular product. This should be a name you'll clearly identify as related to the particular donation campaing you are handling||
|image | ''| An image to be displayed in the cart. Please note that this image is not rendered in the form. If you want to render images in the form, use the slots as described in the slots table.||
|url | ''| A URL to the donation campaign. It will be displayed in the cart, so that the user can visit the donation campaign from there.||
|currency | '$'| The currency symbol to be displayed||
|value | '100'| The default value of the donation. The donation button will initially have this value. User can change it using the donation options provided.||
|valueWeight | 1| The position the value field should have in the form||
|valueType | 'radio'|The widget to be used for the value selection. It can be **radio** or **select**|
|valueOptions| [] | The value options the user will be provided in this donation campaign. If left empty no widget for value selection will be displayed||
|valueLabel | 'Select the value'| The label used in the donation value widget||
|askValueOther | false | Whether the user should be provided with an option to give a custom amount. If this option is set, there will be an option called "other". If the user choose this option a text field is shown to receive the custom amount.||
|askDesignationOther | false;
|askRecurrence | false;
|recurrenceWeight | 2;
|recurrenceLabel | this.vocabulary.defaultRecurrenceLabel;
|designationType | 'checkbox';
|designationWeight | 5;
|designationLabel | this.vocabulary.defaultDesignationLabel;
|designationOptions | [];
|askAnonymous | false;
|anonymousWeight | 4;
|askComment | false;
|commentWeight | 3;
|commentLabel | this.vocabulary.defaultCommentLabel;
|commentPlaceholder | this.vocabulary.defaultCommentPlaceholder;
|submitButtonIcon | true;
|submitButtonText | this.vocabulary.defaultSubmitButtonText;

### Slots

## Introduction

### The form parts

The Donation form is composed of 5 parts plus a donation button. All parts are optional, except for the donation button. The parts are:

1. A donation value (value)
1. A recurrence (recurrence)
1. A comment (comment)
1. An anonymous (anonymous)
1. A designation (designation)

Each of these parts can be customized and they may include several fields to achieve their purpose.

The parts displayed in the order above by default, but you can customize that by setting a weight to the parts.  The "heavier" the part, the lower it will appear in the form. Using `commentWeight=10`, for example, you can make the comment field be the last in the form, while by using `commentWeight=-1` you can make it be the first.

[Check the Form Parts section](#form-parts) to lear how to use and customize
each form part.

### The slots

Web components allow you to include your own markup in special places called slots. Donation form has many slots designed to allow you place your tags where you need them. There are two kind of slots in donation form: `part slots` and `position slots`.

#### "Before and after": position slots

There is a slot before and after each part of the form so you may add explanations, images and other relevant content between each part.
Position slots are simply slots that preceed and succeed each part.

You can reference a position using `before-0` or `after-0` where `0` needs to be replaced with the position number.

To add a tag before the first part you'd use `before-0`. To add a tag after the second part you'd use `after-1`.

#### Part slots

Each part has a slot named after the the part name.

You can add a tag to the designation slot using the name `designation`.

### The cart attribute options

There are some attribute options you can use that will affect how the product will be displayed in your cart.

- name: the name of the this particular product or donation campaign
- code: a unique identifier of this product or donation campaign
- image: a url of an image to be displayed beside the product or donation campaign in the cart
- url: a url of the product or donaiton campaign

## Form Parts

Here's how you can use each form part to customize your donation form.

### Value

#### value (default: 100)

This option simply sets the default donation value. This value is displayed inside the donation button.

#### valueOptions (default: [])

You can provide a list of possible values. If you do, the user will be able to choose one of the possible donation values.
If you omit this attribute, only the default value will be available.

Example:

```html
<foxy-donation storeSubdomain="my-foxystore-subdomain.foxycart.com" valueOptions="[20, 50, 100, 300]"></foxy-donation>
```

#### valueWeight (default: 1)

Sets the position this field will be in the form. Bigger numbers will move it downards.

Making the value come last.

```html
<foxy-donation storeSubdomain="my-foxystore-subdomain.foxycart.com" valueWeight="10"></foxy-donation>
```


#### valueType (default: radio)

You can choose between radio buttons or a select list to display the possible donation values


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

